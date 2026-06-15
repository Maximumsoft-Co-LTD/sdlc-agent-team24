export type BookStatus = 'draft' | 'pending_review' | 'published' | 'suspended' | 'rejected';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  price_buy: number;
  price_rent: number | null;
  rent_days: number;
  epub_key?: string;
}

/** FR-2 — catalog shows published only */
export function filterPublishedBooks(books: Book[]): Book[] {
  return books.filter((b) => b.status === 'published');
}

/** FR-4 — rent button only when price_rent is set */
export function isRentAvailable(book: Book): boolean {
  return book.price_rent !== null && book.price_rent > 0;
}

/** FR-2 — detail returns 404 for non-published */
export function canViewBookDetail(book: Book): boolean {
  return book.status === 'published';
}

/** FR-12 — strip sensitive fields from API response */
export function toPublicBook(book: Book) {
  const { epub_key: _epubKey, ...publicFields } = book;
  return {
    ...publicFields,
    rentAvailable: isRentAvailable(book),
  };
}

/** FR-3 — simple title/author search (unit-testable filter) */
export function searchBooks(books: Book[], query: string): Book[] {
  const published = filterPublishedBooks(books);
  const q = query.trim().toLowerCase();
  if (!q) {
    return published;
  }
  return published.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q),
  );
}
