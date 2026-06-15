// All MongoDB document interfaces use string for ObjectId fields

export interface User {
  _id?: string
  email: string
  passwordHash: string
  displayName: string
  role: 'reader' | 'publisher' | 'admin'
  publisherId?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Publisher {
  _id?: string
  name: string
  description?: string
  logoUrl?: string
  userId: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Book {
  _id?: string
  title: string
  titleSlug: string
  authorName: string
  publisherId: string
  description?: string
  coverUrl?: string
  epubKey?: string
  price: number
  categories: string[]
  tags: string[]
  language: 'th' | 'en'
  status: 'draft' | 'published' | 'unpublished'
  totalPages?: number
  isbn?: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  bookId: string
  title: string
  price: number
  publisherId: string
}

export interface Order {
  _id?: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'wallet'
  createdAt: Date
  updatedAt: Date
}

export interface Entitlement {
  _id?: string
  userId: string
  bookId: string
  orderId: string
  grantedAt: Date
}

export interface ReadingProgress {
  _id?: string
  userId: string
  bookId: string
  cfi: string
  percentage: number
  updatedAt: Date
}

export interface RevenueSplit {
  _id?: string
  orderId: string
  bookId: string
  publisherId: string
  grossAmount: number
  platformFeeRate: number
  platformFee: number
  publisherAmount: number
  settledAt?: Date
  createdAt: Date
}

export interface Wallet {
  _id?: string
  userId: string
  balance: number
  updatedAt: Date
}

export interface WalletTransaction {
  _id?: string
  userId: string
  type: 'topup' | 'purchase' | 'refund' | 'payout'
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  note?: string
  createdAt: Date
}

export interface CoinPackage {
  _id?: string
  name: string
  coins: number
  price: number
  currency: 'THB'
  isActive: boolean
  createdAt: Date
}

export interface Topup {
  _id?: string
  userId: string
  packageId: string
  coins: number
  amount: number
  currency: 'THB'
  status: 'pending' | 'completed' | 'failed'
  paymentGatewayRef?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  bookId: string
  title: string
  coverUrl?: string
  price: number
  publisherId: string
  addedAt: Date
}

export interface Cart {
  _id?: string
  userId: string
  items: CartItem[]
  updatedAt: Date
}

export interface AuditLog {
  _id?: string
  actorId: string
  actorRole: string
  action: string
  targetCollection?: string
  targetId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
