import type { Book } from '../lib/book-catalog.js';

/** QA-001 §2.1 — seed books (published, draft, suspended, rent-null) */
export const books: Book[] = [
  {
    id: 'book-published-rent-001',
    title: 'กลิ่นกาสะลอง',
    author: 'ทมยันตี',
    status: 'published',
    price_buy: 299,
    price_rent: 49,
    rent_days: 7,
    epub_key: 'private/epub/glin-gasalong.epub',
  },
  {
    id: 'book-published-buyonly-002',
    title: 'Design Patterns',
    author: 'Gang of Four',
    status: 'published',
    price_buy: 450,
    price_rent: null,
    rent_days: 7,
    epub_key: 'private/epub/design-patterns.epub',
  },
  {
    id: 'book-published-rent-003',
    title: 'Clean Code',
    author: 'Robert Martin',
    status: 'published',
    price_buy: 380,
    price_rent: 59,
    rent_days: 14,
    epub_key: 'private/epub/clean-code.epub',
  },
  {
    id: 'book-draft-004',
    title: 'Draft Novel',
    author: 'Unknown',
    status: 'draft',
    price_buy: 199,
    price_rent: 29,
    rent_days: 7,
    epub_key: 'private/epub/draft.epub',
  },
  {
    id: 'book-suspended-005',
    title: 'Suspended Book',
    author: 'Former Author',
    status: 'suspended',
    price_buy: 250,
    price_rent: 39,
    rent_days: 7,
    epub_key: 'private/epub/suspended.epub',
  },
];

export const publishedBooks = books.filter((b) => b.status === 'published');
export const rentableBook = books[0];
export const buyOnlyBook = books[1];
