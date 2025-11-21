import { Decimal } from 'decimal.js';

export class InvoiceCalculator {
  /**
   * Calculate utility usage delta.
   * Handles meter rollover if necessary (not implemented here for simplicity, assuming monotonic).
   */
  static calculateUtilityUsage(currentReading: number, previousReading: number): number {
    if (currentReading < previousReading) {
      throw new Error('Current reading cannot be less than previous reading');
    }
    return currentReading - previousReading;
  }

  /**
   * Distribute total utility cost among tenants based on their usage.
   * Returns a map of TenantID -> Cost.
   */
  static distributeUtilityCosts(totalCost: Decimal, tenantUsages: Map<number, number>): Map<number, Decimal> {
    const totalUsage = Array.from(tenantUsages.values()).reduce((a, b) => a + b, 0);

    if (totalUsage === 0) {
      return new Map(); // No usage, no cost distribution (or handle as fixed cost?)
    }

    const distribution = new Map<number, Decimal>();
    for (const [tenantId, usage] of tenantUsages) {
      const ratio = new Decimal(usage).div(totalUsage);
      const cost = totalCost.mul(ratio);
      distribution.set(tenantId, cost);
    }
    return distribution;
  }

  /**
   * Calculate Electricity Cost and VAT.
   * Rule: Total Amount includes VAT. Cost is 10/11, VAT is 1/11.
   */
  static calculateElectricityVat(totalAmount: Decimal): { cost: Decimal; vat: Decimal } {
    // cost = total * 10 / 11
    // vat = total * 1 / 11
    const cost = totalAmount.mul(10).div(11);
    const vat = totalAmount.sub(cost); // Ensure total matches exactly
    return { cost, vat };
  }

  /**
   * Calculate Rent VAT.
   * Rule: 10% of Base Rent.
   */
  static calculateRentVat(baseRent: Decimal): Decimal {
    return baseRent.mul(0.1);
  }

  /**
   * Calculate Management Fee VAT.
   * Rule: 10% of Management Fee.
   */
  static calculateManagementFeeVat(fee: Decimal): Decimal {
    return fee.mul(0.1);
  }
}
