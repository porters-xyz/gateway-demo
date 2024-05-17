import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { AppRule, PrismaClient, Tenant } from '@/.generated/client';
import { UserService } from '../user/user.service';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AppsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
    private userService: UserService,
  ) {}

  async getRuleType(ruleName: string) {
    const ruleType = await this.prisma.client.ruleType.findUniqueOrThrow({
      where: { name: ruleName },
    });

    return ruleType;
  }

  async getTenantsByUser(userAddress: string) {
    const user = await this.userService.getOrCreate(userAddress);

    const enterprises = user.orgs.map((org) => org.enterpriseId);

    const tenants = await this.prisma.client.tenant.findMany({
      where: {
        enterpriseId: {
          in: enterprises,
        },
        deletedAt: null,
      },
    });

    if (!tenants || tenants.length === 0) {
      throw new HttpException('No tenants found', HttpStatus.NOT_FOUND);
    }
    return tenants;
  }

  async getAppsByUser(userAddress: string) {
    const tenants = await this.getTenantsByUser(userAddress);

    const tenantIds = tenants.map((tenant: Tenant) => tenant.id)
    const apps = await this.prisma.client.app.findMany({
      where: {
        tenantId: {
          in: tenantIds,
        },
        deletedAt: null,
      },
      include: {
        appRules: true
      },
    });

    if (!apps || apps?.length === 0) {
      throw new HttpException('No apps found', HttpStatus.NOT_FOUND);
    }

    console.log({appsRule1: apps[0]?.appRules, appsRule2: apps[1]?.appRules })

    return apps;
  }

  async createApp(
    userAddress: string,
    name: string,
    description: string | null | undefined,
  ) {
    const tenants = await this.getTenantsByUser(userAddress);

    if (!tenants) return;
    const newApp = await this.prisma.client.app.create({
      data: {
        tenantId: tenants[0].id,
        name,
        description,
      },
    });

    if (!newApp) {
      return new HttpException(
        `Could not create app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return newApp;
  }

  async updateApp(appId: string, updateAppDto: any) {
    const updatedApp = await this.prisma.client.app.update({
      where: { id: appId },
      data: updateAppDto,
    });

    if (!updatedApp) {
      return new HttpException(
        `Could not update app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedApp;
  }

  async deleteApp(appId: string) {
    const deletedApp = await this.prisma.client.app.update({
      where: { id: appId },
      data: {
        deletedAt: new Date(),
      },
    });

    if (!deletedApp) {
      return new HttpException(
        `Could not delete app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return deletedApp;
  }

  async createAppRule(
    appId: string,
    createAppRuleDto: {
      ruleName: string;
      data: string[];
    },
  ) {
    const { ruleName, data } = createAppRuleDto;
    const ruleType = await this.getRuleType(ruleName);

    const createData = data.map((d: string) => {
      return {
        appId,
        ruleId: ruleType.id,
        value: d,
      };
    });

    const newAppRule = await this.prisma.client.appRule.createMany({
      data: createData,
    });

    if (!newAppRule) {
      return new HttpException(
        `Could not create app rule for this app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newAppRule;
  }

  async updateAppRule(
    appId: string,
    ruleName: string,
    updateAppRuleDto: string[],
  ) {
    const ruleType = await this.getRuleType(ruleName);

    const updateData = updateAppRuleDto.map((u) => {
      return {
        value: u,
      };
    });

    const updatedAppRule = await this.prisma.client.appRule.updateMany({
      where: { id: ruleType.id, appId },
      data: updateData,
    });

    if (!updatedAppRule) {
      return new HttpException(
        `Could not update app rule for this app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedAppRule;
  }

  async deleteAppRule(appId: string, ruleName: string) {
    const ruleType = await this.getRuleType(ruleName);

    const deletedAppRule = await this.prisma.client.appRule.updateMany({
      where: { id: ruleType.id, appId },
      data: {
        deletedAt: new Date(),
      },
    });

    if (!deletedAppRule) {
      return new HttpException(
        `Could not delete app rule for this app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return deletedAppRule;
  }

  async batchUpdateAppRules(
    appId: string,
    updateAppRuleDto: { ruleName: string; data: string[] },
  ) {
    // only support one ruleName at this time
    const {ruleName} = updateAppRuleDto
    const { data: updateData } = updateAppRuleDto;

    const ruleType = await this.getRuleType(ruleName);

    console.log({ruleName, ruleType, appId})

    if (!ruleType || ruleName === 'secret-key' || !ruleName) {
      throw new HttpException(
        'Attempted to update invalid rule type',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingAppRules = await this.prisma.client.appRule.findMany({
      where: { appId, ruleId: ruleType.id },
    });

    // Filter out new rules that are not in existingAppRules
    const newAppRules = updateData?.filter(
      (updateRule) =>
        !existingAppRules.some(
          (existingRule: AppRule) => existingRule.value === updateRule,
        ),
    );

    // Filter out existing rules that are not in updateData
    const deleteAppRules = existingAppRules?.filter(
      (existingRule: AppRule) =>
        !updateData.some(
          (updateRule: string) => existingRule.value === updateRule,
        ),
    );

    const ruleIdsToDelete = deleteAppRules.map((rule: any) => rule.id);

    const ruleDataToCreate = newAppRules.map((newRule) => ({
      appId,
      ruleId: ruleType.id,
      value: newRule,
    }));

    if (ruleType.validationType === 'regex') {
      const regexExp = new RegExp(ruleType.validationValue);
      ruleDataToCreate.forEach((rule) => {
        const matchResult = regexExp.test(rule.value);
        if (!matchResult) {
          throw new HttpException(
            `Regex match failed for value: ${rule.value}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      });
    }

    await this.prisma.client.appRule.updateMany({
      where: {
        appId: appId,
        ruleId: ruleType.id,
        id: {
          in: ruleIdsToDelete,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    const updatedAppRules = await this.prisma.client.appRule.createMany({
      data: ruleDataToCreate,
    });

    return updatedAppRules;
  }

  async updateSecretKeyRule(appId: string, action: 'generate' | 'delete') {
    const ruleType = await this.getRuleType('secret-key');

    const secretIdExists = await this.prisma.client.appRule.findFirst({
      where: { appId, ruleId: ruleType.id },
    });

    if (action === 'delete' && secretIdExists) {
      const deleteSecretKey = await this.prisma.client.appRule.delete({
        where: { id: secretIdExists.id },
      });

      if (deleteSecretKey) {
        return { delete: true };
      }
    }

    if (secretIdExists && action === 'generate') {
      const secretKey = randomBytes(8).toString('hex');
      const hashedKey = createHash('sha256').update(secretKey).digest('hex');

      const updateSecretKey = await this.prisma.client.appRule.update({
        where: { id: secretIdExists.id },
        data: {
          value: hashedKey,
        },
      });

      if (updateSecretKey) {
        return { key: secretKey };
      }
    } else if (!secretIdExists && action === 'generate') {
      const secretKey = randomBytes(8).toString('hex');
      const hashedKey = createHash('sha256').update(secretKey).digest('hex');

      const newSecretKey = await this.prisma.client.appRule.create({
        data: {
          appId,
          ruleId: ruleType.id,
          value: hashedKey,
        },
      });

      if (newSecretKey) {
        return { key: secretKey };
      }
    }
  }
}
