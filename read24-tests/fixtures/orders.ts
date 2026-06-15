import { computeRentExpiresAt } from '../lib/entitlement.js';
import type { Entitlement } from '../lib/entitlement.js';

const paidAt = new Date('2026-06-15T10:00:00.000Z');

export const orders = {
  buyPaid: {
    id: 'order-buy-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-buyonly-002',
    type: 'buy' as const,
    status: 'paid' as const,
    amount_gross: 450,
    payment_method: 'mock' as const,
    paid_at: paidAt.toISOString(),
  },
  rentPaid: {
    id: 'order-rent-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-rent-001',
    type: 'rent' as const,
    status: 'paid' as const,
    amount_gross: 49,
    payment_method: 'mock' as const,
    paid_at: paidAt.toISOString(),
  },
  rentExpired: {
    id: 'order-rent-expired-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-rent-003',
    type: 'rent' as const,
    status: 'paid' as const,
    amount_gross: 59,
    payment_method: 'mock' as const,
    paid_at: '2026-06-01T10:00:00.000Z',
  },
  pending: {
    id: 'order-pending-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-rent-001',
    type: 'buy' as const,
    status: 'pending' as const,
    amount_gross: 299,
    payment_method: 'coin' as const,
  },
};

export const entitlements: Entitlement[] = [
  {
    id: 'ent-own-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-buyonly-002',
    order_id: orders.buyPaid.id,
    type: 'own',
    status: 'active',
    expires_at: null,
  },
  {
    id: 'ent-rent-active-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-rent-001',
    order_id: orders.rentPaid.id,
    type: 'rent',
    status: 'active',
    expires_at: computeRentExpiresAt(paidAt, 7).toISOString(),
  },
  {
    id: 'ent-rent-expired-001',
    user_id: 'user-reader-001',
    book_id: 'book-published-rent-003',
    order_id: orders.rentExpired.id,
    type: 'rent',
    status: 'active',
    expires_at: computeRentExpiresAt(new Date(orders.rentExpired.paid_at!), 14).toISOString(),
  },
];

export const cartItems = [
  { book_id: 'book-published-buyonly-002', type: 'buy' as const },
  { book_id: 'book-published-rent-003', type: 'buy' as const },
];
