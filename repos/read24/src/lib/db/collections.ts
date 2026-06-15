import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

// Raw document shapes stored in MongoDB (snake_case to match seed/API spec)
export interface UserDoc {
  _id: ObjectId
  email: string
  password_hash: string
  display_name: string
  role: 'reader' | 'publisher' | 'admin'
  publisher_id: ObjectId | null
  avatar_url?: string
  created_at: Date
  updated_at?: Date
}

export interface PublisherDoc {
  _id: ObjectId
  name: string
  description?: string
  logo_url?: string
  revenue_share: number
  is_exclusive_default: boolean
  contract_ref?: string
  territory?: string
  created_at: Date
}

export interface BookDoc {
  _id: ObjectId
  title: string
  author: string
  publisher_id: ObjectId
  description?: string
  cover_url?: string
  epub_key?: string | null
  price_buy: number
  price_rent?: number | null
  rent_days?: number | null
  category?: string
  status: 'draft' | 'pending_review' | 'published' | 'unpublished' | 'rejected' | 'suspended'
  published_at?: Date | null
  is_exclusive?: boolean
  rejection_reason?: string | null
  created_at: Date
  updated_at?: Date
}

export interface OrderDoc {
  _id: ObjectId
  user_id: ObjectId
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  amount_gross: number
  payment_method: 'mock' | 'coin'
  payment_ref?: string
  created_at: Date
  paid_at?: Date | null
}

export interface OrderItemDoc {
  _id: ObjectId
  order_id: ObjectId
  book_id: ObjectId
  type: 'buy' | 'rent'
  unit_price: number
  rent_days?: number | null
}

export interface EntitlementDoc {
  _id: ObjectId
  user_id: ObjectId
  book_id: ObjectId
  order_item_id: ObjectId
  type: 'own' | 'rent'
  status: 'active' | 'expired'
  expires_at?: Date | null
  created_at: Date
}

export interface ReadingProgressDoc {
  _id: ObjectId
  user_id: ObjectId
  book_id: ObjectId
  cfi: string
  percent: number
  updated_at: Date
}

export interface RevenueSplitDoc {
  _id: ObjectId
  order_item_id: ObjectId
  gross: number
  gateway_fee: number
  net: number
  platform_cut: number
  publisher_share: number
  publisher_id: ObjectId
  created_at: Date
}

export interface WalletDoc {
  _id: ObjectId
  user_id: ObjectId
  balance: number
  updated_at: Date
}

export interface WalletTransactionDoc {
  _id: ObjectId
  wallet_id: ObjectId
  type: 'topup' | 'bonus' | 'spend' | 'refund' | 'payout'
  amount: number
  balance_after: number
  ref_type?: string
  ref_id?: ObjectId
  created_at: Date
}

export interface CoinPackageDoc {
  _id: ObjectId
  coins: number
  bonus: number
  price_thb: number
  active: boolean
}

export interface TopupDoc {
  _id: ObjectId
  user_id: ObjectId
  package_id: ObjectId
  coins: number
  amount_thb: number
  status: 'pending' | 'completed' | 'failed'
  payment_ref?: string
  created_at: Date
  updated_at: Date
}

export interface CartDoc {
  _id: ObjectId
  user_id: ObjectId
  updated_at: Date
}

export interface CartItemDoc {
  _id: ObjectId
  cart_id: ObjectId
  book_id: ObjectId
  added_at: Date
}

export interface AuditLogDoc {
  _id: ObjectId
  actor_user_id: ObjectId
  actor_role: string
  action: string
  target_type?: string
  target_id?: ObjectId
  metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: Date
}

export const getUsers = async () => (await getDb()).collection<UserDoc>('users')
export const getPublishers = async () => (await getDb()).collection<PublisherDoc>('publishers')
export const getBooks = async () => (await getDb()).collection<BookDoc>('books')
export const getOrders = async () => (await getDb()).collection<OrderDoc>('orders')
export const getOrderItems = async () => (await getDb()).collection<OrderItemDoc>('order_items')
export const getEntitlements = async () => (await getDb()).collection<EntitlementDoc>('entitlements')
export const getReadingProgress = async () => (await getDb()).collection<ReadingProgressDoc>('reading_progress')
export const getRevenueSplits = async () => (await getDb()).collection<RevenueSplitDoc>('revenue_splits')
export const getWallets = async () => (await getDb()).collection<WalletDoc>('wallets')
export const getWalletTransactions = async () => (await getDb()).collection<WalletTransactionDoc>('wallet_transactions')
export const getCoinPackages = async () => (await getDb()).collection<CoinPackageDoc>('coin_packages')
export const getTopups = async () => (await getDb()).collection<TopupDoc>('topups')
export const getCarts = async () => (await getDb()).collection<CartDoc>('carts')
export const getCartItems = async () => (await getDb()).collection<CartItemDoc>('cart_items')
export const getAuditLogs = async () => (await getDb()).collection<AuditLogDoc>('audit_logs')
