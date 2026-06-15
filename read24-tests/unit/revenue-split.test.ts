import { describe, it, expect } from 'vitest';
import {
  calculateRevenueSplit,
  isRevenueSplitBalanced,
} from '../lib/revenue-split.js';

describe('calculateRevenueSplit — FR-8, FR-17, NFR-5', () => {
  const cases = [
    {
      name: 'mock payment with 3% gateway fee',
      input: {
        gross: 299,
        gatewayFeeRate: 0.03,
        paymentMethod: 'mock' as const,
        publisherRevenueShare: 0.7,
      },
      expectGatewayFee: 9,
    },
    {
      name: 'coin payment has zero gateway fee (PRD A-8)',
      input: {
        gross: 450,
        gatewayFeeRate: 0.03,
        paymentMethod: 'coin' as const,
        publisherRevenueShare: 0.7,
      },
      expectGatewayFee: 0,
    },
    {
      name: 'zero gross',
      input: {
        gross: 0,
        gatewayFeeRate: 0.03,
        paymentMethod: 'mock' as const,
        publisherRevenueShare: 0.7,
      },
      expectGatewayFee: 0,
    },
  ];

  for (const tc of cases) {
    it(`TC-FR17-02: ${tc.name}`, () => {
      const split = calculateRevenueSplit(tc.input);
      expect(split.gateway_fee).toBe(tc.expectGatewayFee);
      expect(split.net).toBe(tc.input.gross - tc.expectGatewayFee);
      expect(isRevenueSplitBalanced(split)).toBe(true);
      expect(split.platform_cut + split.publisher_share).toBe(split.net);
    });
  }

  it('TC-FR17-02: rejects negative gross', () => {
    expect(() =>
      calculateRevenueSplit({
        gross: -1,
        gatewayFeeRate: 0.03,
        paymentMethod: 'mock',
        publisherRevenueShare: 0.7,
      }),
    ).toThrow();
  });
});
