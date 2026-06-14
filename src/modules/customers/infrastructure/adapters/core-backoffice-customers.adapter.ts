import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ICustomersRepository,
  CustomerDetailData,
  CustomerSnapshotData,
  CustomerPointsData,
} from '../../domain/ports/customers.repository';
import { CorePointsClient } from '../../../../shared/infrastructure/core-points.client';
import type { CorePointsProfileSummaryDto } from '../../../../shared/infrastructure/core-points.client';
import { customersSnapshotsMock } from './customers-mock';

@Injectable()
export class CoreBackofficeCustomersAdapter implements ICustomersRepository {
  constructor(
    private readonly corePoints: CorePointsClient,
  ) {}

  async getCustomerSnapshot(customerId: string): Promise<{
    source: 'mock' | 'live';
    item: CustomerDetailData;
    integrations: { corePoints: { available: boolean; mode: string; baseUrl?: string; checkedAt: string; error?: string } };
  }> {
    const customer = customersSnapshotsMock.find((item) => item.customerId === customerId);
    if (!customer) throw new NotFoundException(`Backoffice customer ${customerId} not found`);

    const corePoints = await this.corePoints.getHealth();
    if (!corePoints.available) {
      return { source: 'mock', item: this.toCustomerDetail(customer), integrations: { corePoints } };
    }

    try {
      const profile = await this.corePoints.getCustomerProfileSummary(customerId);
      return {
        source: 'mock',
        item: this.mergeCustomerDetail(customer, profile),
        integrations: { corePoints },
      };
    } catch {
      return { source: 'mock', item: this.toCustomerDetail(customer), integrations: { corePoints } };
    }
  }

  async getCustomerPoints(customerId: string): Promise<CustomerPointsData> {
    const [balance, transactions] = await Promise.all([
      this.corePoints.getCustomerBalance(customerId),
      this.corePoints.getCustomerTransactions(customerId),
    ]);
    return {
      customerId,
      source: balance ? 'core-points' : 'not_found',
      balance: balance ?? {
        customerId,
        balancePoints: 0,
        lifetimeAccrued: 0,
        lifetimeRedeemed: 0,
        updatedAt: new Date().toISOString(),
      },
      transactions,
    };
  }

  private toCustomerDetail(customer: CustomerSnapshotData): CustomerDetailData {
    return { ...customer };
  }

  private mergeCustomerSnapshot(
    customer: CustomerSnapshotData,
    profile: CorePointsProfileSummaryDto,
  ): CustomerSnapshotData {
    return {
      ...customer,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      tier: profile.loyaltyTier || customer.tier,
      status:
        profile.passwordChangeStatus === 'pending'
          ? 'password-reset-pending'
          : profile.enrollmentStatus || profile.stage || customer.status,
    };
  }

  private mergeCustomerDetail(
    customer: CustomerSnapshotData,
    profile: CorePointsProfileSummaryDto,
  ): CustomerDetailData {
    const base = this.mergeCustomerSnapshot(customer, profile);
    return {
      ...base,
      customerEmailHash: profile.customerEmailHash,
      enrollmentStatus: profile.enrollmentStatus,
      enrollmentTransactionId: profile.enrollmentTransactionId,
      passwordChangeStatus: profile.passwordChangeStatus,
      passwordChangeRequestId: profile.passwordChangeRequestId,
      lastLoginId: profile.lastLoginId,
      lastLoginAt: profile.lastLoginAt,
      source: profile.source,
      stage: profile.stage,
      updatedAt: profile.updatedAt,
    };
  }
}
