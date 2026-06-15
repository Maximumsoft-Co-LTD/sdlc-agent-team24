import type { WalletTransaction } from '../lib/wallet.js';

/** FR-13 — new user wallet starts at 0 */
export const emptyWallet = {
  user_id: 'user-reader-001',
  balance: 0,
  transactions: [] as WalletTransaction[],
};

/** After topup pkg-starter: 100 + 10 bonus */
export const walletAfterTopup: WalletTransaction[] = [
  {
    id: 'tx-topup-001',
    type: 'topup',
    amount: 100,
    balance_after: 100,
    created_at: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'tx-bonus-001',
    type: 'bonus',
    amount: 10,
    balance_after: 110,
    created_at: '2026-06-15T10:00:00.001Z',
  },
];

/** After spending 49 coins on rent */
export const walletAfterSpend: WalletTransaction[] = [
  ...walletAfterTopup,
  {
    id: 'tx-spend-001',
    type: 'spend',
    amount: -49,
    balance_after: 61,
    created_at: '2026-06-15T10:05:00.000Z',
  },
];

export const walletBalanceAfterTopup = 110;
export const walletBalanceAfterSpend = 61;
