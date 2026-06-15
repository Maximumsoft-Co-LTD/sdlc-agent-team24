/**
 * Golden API response fixtures for contract/schema validation.
 * Maps to QA-001 TC-IDs — used when live API is unavailable.
 */
import { publishedBooks } from './books.js';
import { users } from './users.js';
import { walletBalanceAfterTopup } from './wallets.js';

const publicBook = (book: (typeof publishedBooks)[0]) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  coverUrl: `https://cdn.demo.test/covers/${book.id}.jpg`,
  priceBuy: book.price_buy,
  priceRent: book.price_rent,
  rentDays: book.rent_days,
  rentAvailable: book.price_rent !== null && book.price_rent > 0,
  rating: 4.5,
});

export const authLoginSuccess = {
  data: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo',
    user: {
      id: 'user-reader-001',
      email: users.reader.email,
      displayName: users.reader.displayName,
      role: users.reader.role,
    },
  },
  error: null,
  meta: null,
};

export const authLoginFailure = {
  data: null,
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  meta: null,
};

export const booksListSuccess = {
  data: {
    items: publishedBooks.map(publicBook),
    nextCursor: null,
  },
  error: null,
  meta: { total: publishedBooks.length },
};

export const bookDetailSuccess = {
  data: publicBook(publishedBooks[0]),
  error: null,
  meta: null,
};

export const orderBuySuccess = {
  data: {
    id: 'order-buy-001',
    status: 'paid',
    type: 'buy',
    bookId: publishedBooks[1].id,
    amountGross: publishedBooks[1].price_buy,
    entitlement: { type: 'own', status: 'active' },
  },
  error: null,
  meta: null,
};

export const walletBalanceSuccess = {
  data: { balance: walletBalanceAfterTopup },
  error: null,
  meta: null,
};

export const insufficientCoinsError = {
  data: null,
  error: { code: 'INSUFFICIENT_COINS', message: 'Not enough coins' },
  meta: null,
};

export const noEntitlementError = {
  data: null,
  error: { code: 'NO_ENTITLEMENT', message: 'No active entitlement for this book' },
  meta: null,
};

export const forbiddenError = {
  data: null,
  error: { code: 'FORBIDDEN', message: 'Insufficient role' },
  meta: null,
};

export const librarySuccess = {
  data: {
    owned: [{ bookId: publishedBooks[1].id, type: 'own' }],
    renting: [{ bookId: publishedBooks[0].id, type: 'rent', daysLeft: 5 }],
    expired: [],
  },
  error: null,
  meta: null,
};

export const cartCheckoutSuccess = {
  data: {
    orderId: 'order-cart-001',
    amount: 830,
    itemCount: 2,
    entitlementsCreated: 2,
  },
  error: null,
  meta: null,
};
