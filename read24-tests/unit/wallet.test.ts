import { describe, it, expect } from 'vitest';
import {
  sumLedger,
  reconcileBalance,
  canSpend,
  applySpend,
  shouldProcessOrder,
  validateBalanceAfterChain,
} from '../lib/wallet.js';
import {
  emptyWallet,
  walletAfterTopup,
  walletAfterSpend,
  walletBalanceAfterTopup,
  walletBalanceAfterSpend,
} from '../fixtures/wallets.js';
import { orders } from '../fixtures/orders.js';

describe('wallet — FR-13,14,15,16, NFR-8', () => {
  it('TC-FR13-01: new wallet balance is 0', () => {
    expect(emptyWallet.balance).toBe(0);
    expect(sumLedger(emptyWallet.transactions)).toBe(0);
  });

  it('TC-FR13-02 / TC-NFR8-01: balance equals SUM(ledger)', () => {
    expect(reconcileBalance(walletBalanceAfterTopup, walletAfterTopup)).toBe(true);
    expect(reconcileBalance(walletBalanceAfterSpend, walletAfterSpend)).toBe(true);
  });

  it('TC-FR14-03 / TC-FR16-02: balance_after chain is valid', () => {
    expect(validateBalanceAfterChain(walletAfterTopup)).toBe(true);
    expect(validateBalanceAfterChain(walletAfterSpend)).toBe(true);
  });

  const spendCases = [
    {
      name: 'TC-FR15-01: sufficient balance',
      balance: 110,
      amount: 49,
      success: true,
      newBalance: 61,
    },
    {
      name: 'TC-FR15-02: insufficient balance',
      balance: 10,
      amount: 100,
      success: false,
      newBalance: 10,
    },
    {
      name: 'TC-FR15-04: cannot go negative',
      balance: 0,
      amount: 1,
      success: false,
      newBalance: 0,
    },
  ];

  for (const tc of spendCases) {
    it(tc.name, () => {
      expect(canSpend(tc.balance, tc.amount)).toBe(tc.success);
      const result = applySpend(tc.balance, tc.amount);
      expect(result.success).toBe(tc.success);
      expect(result.newBalance).toBe(tc.newBalance);
    });
  }

  it('TC-FR8-03 / TC-FR15-03: paid order is not reprocessed', () => {
    expect(shouldProcessOrder(orders.buyPaid.status)).toBe(false);
    expect(shouldProcessOrder(orders.pending.status)).toBe(true);
  });
});
