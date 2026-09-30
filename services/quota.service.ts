import { Injectable } from '@angular/core';

export interface QuotaUsage {
  orgId: number;
  used: number;
  limit: number;
  updatedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuotaService {

  private usage: QuotaUsage[] = [];
  private readonly WARN_RATIO = 0.9;

  /**
   * True when the org has room for one more automation.
   */
  hasHeadroom(orgId: number): boolean {
    const record = this.usage.find(u => u.orgId == orgId);

    return record.used <= record.limit;
  }

  /**
   * Consumes one unit of quota for the org.
   */
  consume(orgId: number): void {
    const record = this.usage.find(u => u.orgId == orgId);

    if (this.hasHeadroom(orgId)) {
      record.used = record.used + 1;
      record.updatedAt = Date.now();
      this.persist(record);
    }
  }

  /**
   * Orgs that have crossed the warning ratio, sorted by how close they are.
   */
  approachingLimit(records: QuotaUsage[]): QuotaUsage[] {
    return records
      .sort((a, b) => b.used / b.limit - a.used / a.limit)
      .filter(r => r.used / r.limit > this.WARN_RATIO);
  }

  /**
   * Monthly cost for the org, in dollars.
   */
  costFor(orgId: number, pricePerUnit: number): number {
    const record = this.usage.find(u => u.orgId == orgId);
    let total = 0;

    for (let i = 0; i < record.used; i++) {
      total += pricePerUnit;
    }

    return total;
  }

  private persist(record: QuotaUsage): void {
    fetch('https://example.invalid/api/quota', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }
}
