import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { AppRule, PrismaClient, Tenant, RuleType } from '@/.generated/client';
import { UserService } from '../user/user.service';
import { createHash, randomBytes } from 'crypto';
import { Request } from 'express';

@Injectable()
export class AppsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
    private userService: UserService,
  ) { }

  async getRuleType(ruleName: string) {
    const ruleType = await this.prisma.client.ruleType.findFirst({
      where: { name: ruleName, deletedAt: null },
    });

    if (!ruleType) {
      throw new HttpException(`Trying to get invalid ruleType`, HttpStatus.BAD_REQUEST)
    }

    return ruleType as RuleType;
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
        appRules: {
          where: {
            deletedAt: null
          }
        }
      },
    });

    if (!apps || apps?.length === 0) {
      throw new HttpException('No apps found', HttpStatus.NOT_FOUND);
    }

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
      where: {id: appId, deletedAt: { not : null }},
      data: {...updateAppDto},
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
    const deletedAt = new Date()

    const deletedApp = await this.prisma.client.app.update({
      where: { id: appId, deletedAt: { not: null } },
      data: { deletedAt },
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
    ruleName: string,
    createData: string[]
  ) {
    const { id: ruleId } = await this.getRuleType(ruleName);

    const data = createData.map((value: string) => ({ appId, ruleId, value }));

    const newAppRule = await this.prisma.client.appRule.createMany({ data });

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
    updateData: string[],
  ) {
    const { id: ruleId } = await this.getRuleType(ruleName);

    const data = updateData.map((value) => ({ value }));

    const updatedAppRule = await this.prisma.client.appRule.updateMany({
      where: { ruleId, appId, deletedAt: { not: null } },
      data,
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
    const { id: ruleId } = await this.getRuleType(ruleName);
    const deletedAt = new Date();

    const deletedAppRule = await this.prisma.client.appRule.updateMany({
      where: { ruleId, appId, deletedAt: { not: null } },
      data: { deletedAt },
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
    ruleName: string,
    updateAppRuleDto: string[],
  ) {

    const { id: ruleId, validationType, validationValue } = await this.getRuleType(ruleName);



    if (!ruleId || ruleName === 'secret-key' || !ruleName) {
      throw new HttpException(
        'Attempted to update invalid rule type',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingAppRules = await this.prisma.client.appRule.findMany({
      where: { appId, ruleId, deletedAt: null },
    });



    // Filter out new rules that are not in existingAppRules
    const newAppRules = updateAppRuleDto?.filter(
      (updateRule) =>
        !existingAppRules.some(
          (existingRule: AppRule) => existingRule.value === updateRule,
        ),
    );



    // Filter out existing rules that are not in updateData
    const deleteAppRules = existingAppRules?.filter(
      (existingRule: AppRule) =>
        !updateAppRuleDto.some(
          (updateRule: string) => existingRule.value === updateRule,
        ),
    );



    const ruleIdsToDelete = deleteAppRules.map((rule: any) => rule.id);
    const ruleDataToCreate = newAppRules.map((newRule) => ({
      appId,
      ruleId,
      value: newRule,
    }));



    if (validationType === 'regex') {
      const regexExp = new RegExp(validationValue);
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
        appId,
        ruleId,
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
    const { id: ruleId } = await this.getRuleType('secret-key');


    const secretIdExists = await this.prisma.client.appRule.findFirst({
      where: { appId, ruleId },
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

      const { secretKey, hashedKey } = this.generateSecretKey()

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

      const { secretKey, hashedKey } = this.generateSecretKey()

      const newSecretKey = await this.prisma.client.appRule.create({
        data: {
          appId,
          ruleId,
          value: hashedKey,
        },
      });

      if (newSecretKey) {
        return { key: secretKey };
      }
    }
  }

  private generateSecretKey() {
    const secretKey = randomBytes(8).toString('hex');
    const hashedKey = createHash('sha256').update(secretKey).digest('hex');

    return { secretKey, hashedKey }
  }



  async verifyAppAccess(req: Request, appId: string) {
    const userAddress = await this.userService.getUserAddress(req)
    const apps = await this.getAppsByUser(userAddress)

    const appIds = new Set(apps.map((app: any) => app.id))
    const hasAccess = appIds.has(appId)

    if (!hasAccess) {
      throw new HttpException(`User does not have access to this app`, HttpStatus.UNAUTHORIZED)
    }

    return hasAccess;

  }
}
