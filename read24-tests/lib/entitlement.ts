export type EntitlementType = 'own' | 'rent';
export type EntitlementStatus = 'active' | 'expired';

export interface Entitlement {
  id: string;
  user_id: string;
  book_id: string;
  order_id: string;
  type: EntitlementType;
  status: EntitlementStatus;
  expires_at?: string | null;
}

/**
 * Lazy expiry check (BE-005) — FR-7, R-3.
 * Rent entitlements expire when expires_at <= now.
 */
export function isEntitlementActive(
  entitlement: Entitlement,
  now: Date = new Date(),
): boolean {
  if (entitlement.status === 'expired') {
    return false;
  }
  if (entitlement.type === 'own') {
    return true;
  }
  if (!entitlement.expires_at) {
    return false;
  }
  return new Date(entitlement.expires_at) > now;
}

export function resolveEntitlementStatus(
  entitlement: Entitlement,
  now: Date = new Date(),
): EntitlementStatus {
  if (entitlement.type === 'own') {
    return 'active';
  }
  if (!entitlement.expires_at || new Date(entitlement.expires_at) <= now) {
    return 'expired';
  }
  return 'active';
}

export function daysLeft(expiresAt: string, now: Date = new Date()): number {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export interface LibraryBuckets {
  owned: Entitlement[];
  renting: Entitlement[];
  expired: Entitlement[];
}

/** FR-10 — categorize library by entitlement state */
export function categorizeLibrary(
  entitlements: Entitlement[],
  now: Date = new Date(),
): LibraryBuckets {
  const owned: Entitlement[] = [];
  const renting: Entitlement[] = [];
  const expired: Entitlement[] = [];

  for (const ent of entitlements) {
    const effectiveStatus = resolveEntitlementStatus(ent, now);
    if (ent.type === 'own' && effectiveStatus === 'active') {
      owned.push(ent);
    } else if (ent.type === 'rent' && effectiveStatus === 'active') {
      renting.push(ent);
    } else {
      expired.push(ent);
    }
  }

  return { owned, renting, expired };
}

export function computeRentExpiresAt(paidAt: Date, rentDays: number): Date {
  const expires = new Date(paidAt);
  expires.setDate(expires.getDate() + rentDays);
  return expires;
}
