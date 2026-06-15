import { describe, it, expect } from 'vitest';
import {
  isEntitlementActive,
  resolveEntitlementStatus,
  daysLeft,
  categorizeLibrary,
  computeRentExpiresAt,
} from '../lib/entitlement.js';
import { entitlements } from '../fixtures/orders.js';

describe('entitlement — FR-5,6,7,10,12', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');

  it('TC-FR5-01: own entitlement stays active', () => {
    const own = entitlements[0];
    expect(isEntitlementActive(own, now)).toBe(true);
    expect(resolveEntitlementStatus(own, now)).toBe('active');
  });

  it('TC-FR6-01: rent expires_at = paid + rent_days', () => {
    const paidAt = new Date('2026-06-15T10:00:00.000Z');
    const expires = computeRentExpiresAt(paidAt, 7);
    expect(expires.toISOString()).toBe('2026-06-22T10:00:00.000Z');
  });

  it('TC-FR6-02: daysLeft is correct', () => {
    const rent = entitlements[1];
    expect(daysLeft(rent.expires_at!, now)).toBe(7);
  });

  it('TC-FR7-01: lazy expiry blocks access when past expires_at', () => {
    const expired = entitlements[2];
    expect(isEntitlementActive(expired, now)).toBe(false);
    expect(resolveEntitlementStatus(expired, now)).toBe('expired');
  });

  it('TC-FR10-01: library buckets owned/renting/expired', () => {
    const buckets = categorizeLibrary(entitlements, now);
    expect(buckets.owned).toHaveLength(1);
    expect(buckets.renting).toHaveLength(1);
    expect(buckets.expired).toHaveLength(1);
  });

  it('TC-FR12-01: inactive entitlement is not active', () => {
    const expired = entitlements[2];
    expect(isEntitlementActive(expired, now)).toBe(false);
  });
});
