import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { AppRule, PrismaClient } from '@/.generated/client';
import { UserService } from '../user/user.service';
@Injectable()
export class AppsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
    private userService: UserService,
  ) {}

  async getTenantsByUser(userAddress: string) {
    const user = await this.userService.getOrCreate(userAddress);

    const enterprises = user.orgs.map((org) => org.enterpriseId);

    const tenants = await this.prisma.client.tenant.findMany({
      where: {
        enterpriseId: {
          in: enterprises,
        },
      },
    });

    if (!tenants || tenants.length === 0) {
      throw new HttpException('No tenants found', HttpStatus.NOT_FOUND);
    }
    return tenants;
  }

  async getAppsByUser(userAddress: string) {
    const tenants = await this.getTenantsByUser(userAddress);
    const apps = await this.prisma.client.app.findMany({
      where: {
        tenantId: {
          in: tenants.map((tenant) => tenant.id),
        },
      },
      include: {
        appRules: true,
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
    const deletedApp = await this.prisma.client.app.delete({
      where: { id: appId },
    });

    if (!deletedApp) {
      return new HttpException(
        `Could not delete app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return deletedApp;
  }

  async createAppRule(appId: string, createAppRuleDto: any) {
    const newAppRule = await this.prisma.client.appRule.create({
      data: {
        appId,
        ...createAppRuleDto,
      },
    });
    if (!newAppRule) {
      return new HttpException(
        `Could not create app rule for this app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newAppRule;
  }

  async updateAppRule(appId: string, ruleId: string, updateAppRuleDto: any) {
    const updatedAppRule = await this.prisma.client.appRule.update({
      where: { id: ruleId, appId },
      data: updateAppRuleDto,
    });

    if (!updatedAppRule) {
      return new HttpException(
        `Could not update app rule for this app`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedAppRule;
  }

  async deleteAppRule(appId: string, ruleId: string) {
    const deletedAppRule = await this.prisma.client.appRule.delete({
      where: { id: ruleId, appId },
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
    updateAppRuleDto: { ruleId: string; data: string[] }[],
  ) {
    // only support one ruleId at this time
    const { ruleId, data: updateData } = updateAppRuleDto[0];

    const existingAppRules = await this.prisma.client.appRule.findMany({
      where: { appId, ruleId },
    });

    // Filter out new rules that are not in existingAppRules
    const newAppRules = updateData.filter(
      (updateRule) =>
        !existingAppRules.some(
          (existingRule: AppRule) => existingRule.value === updateRule,
        ),
    );

    // Filter out existing rules that are not in updateData
    const deleteAppRules = existingAppRules.filter(
      (existingRule: AppRule) =>
        !updateData.some(
          (updateRule: string) => existingRule.value === updateRule,
        ),
    );

    const ruleIdsToDelete = deleteAppRules.map((rule) => rule.id);

    const ruleDataToCreate = newAppRules.map((newRule) => ({
      appId,
      ruleId,
      value: newRule,
    }));

    await this.prisma.client.appRule.deleteMany({
      where: {
        appId: appId,
        ruleId: ruleId,
        id: {
          in: ruleIdsToDelete,
        },
      },
    });

    const updatedAppRules = await this.prisma.client.appRule.createMany({
      data: ruleDataToCreate,
    });

    return updatedAppRules;
  }
}
