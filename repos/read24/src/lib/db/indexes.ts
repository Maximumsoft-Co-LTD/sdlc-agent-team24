import {
  getBooks,
  getEntitlements,
  getOrders,
  getWalletTransactions,
  getRevenueSplits,
  getAuditLogs,
  getReadingProgress,
  getWallets,
  getCarts,
  getCartItems,
} from './collections'

export async function createAllIndexes(): Promise<void> {
  // books: text index on title + author, compound (status, category)
  const books = await getBooks()
  await books.createIndex({ title: 'text', author: 'text' }, { name: 'books_text_search' })
  await books.createIndex({ status: 1, category: 1 }, { name: 'books_status_category' })

  // entitlements: unique partial on (user_id, book_id) where status='active',
  // compound (user_id, status), compound (status, expires_at)
  const entitlements = await getEntitlements()
  await entitlements.createIndex(
    { user_id: 1, book_id: 1 },
    {
      name: 'entitlements_active_unique',
      unique: true,
      partialFilterExpression: { status: 'active' },
    }
  )
  await entitlements.createIndex({ user_id: 1, status: 1 }, { name: 'entitlements_user_status' })
  await entitlements.createIndex({ status: 1, expires_at: 1 }, { name: 'entitlements_status_expires' })

  // orders: compound (user_id, created_at), (paid_at)
  const orders = await getOrders()
  await orders.createIndex({ user_id: 1, created_at: -1 }, { name: 'orders_user_created' })
  await orders.createIndex({ paid_at: -1 }, { name: 'orders_paid_at', sparse: true })

  // wallet_transactions: compound (wallet_id, created_at)
  const walletTxns = await getWalletTransactions()
  await walletTxns.createIndex({ wallet_id: 1, created_at: -1 }, { name: 'wallet_txns_wallet_created' })

  // revenue_splits: unique on order_item_id, compound (publisher_id, created_at)
  const revSplits = await getRevenueSplits()
  await revSplits.createIndex({ order_item_id: 1 }, { name: 'rev_splits_order_item_unique', unique: true })
  await revSplits.createIndex({ publisher_id: 1, created_at: -1 }, { name: 'rev_splits_publisher_created' })

  // audit_logs: compound (actor_user_id, created_at), compound (target_type, target_id)
  const auditLogs = await getAuditLogs()
  await auditLogs.createIndex({ actor_user_id: 1, created_at: -1 }, { name: 'audit_logs_actor_created' })
  await auditLogs.createIndex({ target_type: 1, target_id: 1 }, { name: 'audit_logs_target', sparse: true })

  // reading_progress: unique on (user_id, book_id)
  const readingProgress = await getReadingProgress()
  await readingProgress.createIndex(
    { user_id: 1, book_id: 1 },
    { name: 'reading_progress_user_book_unique', unique: true }
  )

  // wallets: unique on user_id
  const wallets = await getWallets()
  await wallets.createIndex({ user_id: 1 }, { name: 'wallets_user_unique', unique: true })

  // carts: unique on user_id
  const carts = await getCarts()
  await carts.createIndex({ user_id: 1 }, { name: 'carts_user_unique', unique: true })

  // cart_items: unique on (cart_id, book_id)
  const cartItems = await getCartItems()
  await cartItems.createIndex(
    { cart_id: 1, book_id: 1 },
    { name: 'cart_items_cart_book_unique', unique: true }
  )
}
