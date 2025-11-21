import { describe, expect, test } from 'bun:test';
import { InvoiceCalculatorService } from './invoice-calculator.service';
import { Decimal } from 'decimal.js';

describe('InvoiceCalculatorService', () => {
  describe('calculateRent', () => {
    test('should calculate 10% VAT correctly for standard rent', () => {
      const baseRent = 2000000;
      const result = InvoiceCalculatorService.calculateRent(baseRent);

      expect(result.amount.equals(new Decimal(2000000))).toBe(true);
      expect(result.vat.equals(new Decimal(200000))).toBe(true);
    });
  });

  describe('calculateElectricity', () => {
    test('should split total amount into 10/11 cost and 1/11 VAT', () => {
      const total = 110000;
      const result = InvoiceCalculatorService.calculateElectricity(total);

      expect(result.cost.equals(new Decimal(100000))).toBe(true);
      expect(result.vat.equals(new Decimal(10000))).toBe(true);
      expect(result.cost.plus(result.vat).equals(new Decimal(total))).toBe(true);
    });

    test('should handle rounding correctly and preserve total', () => {
      // Example: 12345 KRW
      // Cost = 12345 * 10/11 = 11222.72... -> 11223 (rounded)
      // VAT = 12345 - 11223 = 1122
      const total = 12345;
      const result = InvoiceCalculatorService.calculateElectricity(total);

      expect(result.cost.toNumber()).toBe(11223);
      expect(result.vat.toNumber()).toBe(1122);
      expect(result.cost.plus(result.vat).equals(new Decimal(total))).toBe(true);
    });
  });
});
