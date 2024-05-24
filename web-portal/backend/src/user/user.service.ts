import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { createHash } from 'crypto';
import { TenantService } from '../tenant/tenant.service';
import { unsealData } from 'iron-session';
import { Request } from 'express';
import { ISession, SESSION_OPTIONS } from '../siwe/siwe.service';
import { nanoid } from 'nanoid';
import { NANO_ID_LENGTH } from '../utils/const';

@Injectable()
export class UserService {
    constructor(
        @Inject('Postgres')
        private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
        private tenantService: TenantService,
    ) { }

    async getOrCreate(ethAddress: string) {
        const existingUser = await this.prisma.client.user.findUnique({
            where: {
                ethAddress: createHash('sha256').update(ethAddress).digest('hex'),
            },
            include: {
                orgs: {},
            },
        });

        if (!existingUser || existingUser?.orgs?.length === 0) {
            // @note: this will generate enterprise + tenant before creating a new user;
            const { enterpriseId } = await this.tenantService.create(); // <- show this secret for the first time user to backup

            if (!enterpriseId) {
                throw new HttpException(
                    'Unable to create tenant',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            if (existingUser) {
                const updateExistingUser = await this.prisma.client.user.update({
                    where: {
                        id: existingUser.id,
                    },
                    data: {
                        orgs: {
                            create: {
                                enterprise: {
                                    connect: {
                                        id: enterpriseId,
                                    },
                                },
                            },
                        },
                    },

                    include: {
                        orgs: {},
                    },
                });
                const { id, active, createdAt, orgs } = updateExistingUser;

                const tenantId = await this.getTenantIdByEnterpriseId(enterpriseId);
                return { id, active, createdAt, orgs, tenantId };
            }
            const newUser = await this.prisma.client.user.create({
                data: {
                    id: nanoid(NANO_ID_LENGTH),
                    ethAddress: createHash('sha256').update(ethAddress).digest('hex'),
                    orgs: {
                        create: {
                            enterprise: {
                                connect: {
                                    id: enterpriseId,
                                },
                            },
                        },
                    },
                },
                include: {
                    orgs: {},
                },
            });

            if (!newUser)
                throw new HttpException(
                    'Unable to create tenant',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );

            const { id, active, createdAt, orgs } = newUser;

            const tenantId = await this.getTenantIdByEnterpriseId(enterpriseId);

            return { id, active, createdAt, orgs, tenantId, netBalance: 0 };
        }

        const { id, active, createdAt, orgs } = existingUser;

        const tenantId = await this.getTenantIdByEnterpriseId(orgs[0].enterpriseId);

        const netBalance = await this.getTenantBalance(tenantId);

        return { id, active, createdAt, orgs, tenantId, netBalance };
    }

    async getTenantIdByEnterpriseId(enterpriseId: string) {
        const tenants = await this.prisma.client.tenant.findMany({
            where: {
                enterpriseId,
            },
        });

        if (!tenants)
            throw new HttpException(
                'Unable to find tenant',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        return tenants[0].id;
    }

    async getTenantBalance(tenantId: string) {
        const netBalance = await this.prisma.client.$queryRaw`
        SELECT payment.balance - relay.usage as net FROM
        (SELECT
            COALESCE(SUM(case when "transactionType"='CREDIT' then amount else 0 end) -
                SUM(case when "transactionType"='DEBIT' then amount else 0 end), 0)
            AS balance FROM "PaymentLedger" WHERE "tenantId" = ${tenantId}) as payment,
        (SELECT
            COALESCE(SUM(case when "transactionType"='CREDIT' then amount else 0 end) -
        SUM(case when "transactionType"='DEBIT' then amount else 0 end), 0)
            AS usage FROM "RelayLedger" WHERE "tenantId" = ${tenantId}) as relay
      `;

        return netBalance;
    }

    async getUserAddress(req: Request) {

        const sessionCookie = req.cookies?.session;

        if (!sessionCookie) {
            throw new HttpException(`Unauthorized Attempt`, HttpStatus.UNAUTHORIZED)
        }

        const { address } = await unsealData<ISession>(
            sessionCookie,
            SESSION_OPTIONS,
        );

        if (!address) {
            throw new HttpException(`Couldn't decode user address`, HttpStatus.BAD_REQUEST)
        }

        return address
    }
}
