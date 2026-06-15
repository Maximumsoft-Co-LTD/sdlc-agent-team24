export type WalletTransactionType = 'topup' | 'bonus' | 'spend' | 'refund';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  balance_after: number;
  created_at: string;
}

/** NFR-8 — balance must equal SUM(transactions.amount) */
export function sumLedger(transactions: WalletTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function reconcileBalance(
  balance: number,
  transactions: WalletTransaction[],
): boolean {
  return balance === sumLedger(transactions);
}

/** FR-15 — conditional spend: balance >= amount */
export function canSpend(balance: number, amount: number): boolean {
  return amount > 0 && balance >= amount;
}

export interface SpendResult {
  success: boolean;
  newBalance: number;
  error?: 'INSUFFICIENT_COINS' | 'INVALID_AMOUNT';
}

/**
 * Simulates atomic Mongo updateOne with balance guard.
 * Returns success only when modifiedCount would be 1.
 */
export function applySpend(balance: number, amount: number): SpendResult {
  if (amount <= 0) {
    return { success: false, newBalance: balance, error: 'INVALID_AMOUNT' };
  }
  if (balance < amount) {
    return { success: false, newBalance: balance, error: 'INSUFFICIENT_COINS' };
  }
  return { success: true, newBalance: balance - amount };
}

/** Idempotency guard — FR-8, FR-15 */
export function shouldProcessOrder(
  orderStatus: 'pending' | 'paid' | 'failed' | 'refunded',
): boolean {
  return orderStatus === 'pending';
}

export function validateBalanceAfterChain(
  transactions: WalletTransaction[],
): boolean {
  if (transactions.length === 0) {
    return true;
  }
  let running = 0;
  for (const tx of transactions) {
    running += tx.amount;
    if (tx.balance_after !== running) {
      return false;
    }
  }
  return true;
}
