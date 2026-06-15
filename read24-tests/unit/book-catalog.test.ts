import { describe, it, expect } from 'vitest';
import {
  filterPublishedBooks,
  isRentAvailable,
  canViewBookDetail,
  toPublicBook,
  searchBooks,
} from '../lib/book-catalog.js';
import { books, buyOnlyBook, rentableBook } from '../fixtures/books.js';

describe('book catalog — FR-2,3,4,12', () => {
  it('TC-FR2-01: list shows published only', () => {
    const published = filterPublishedBooks(books);
    expect(published.every((b) => b.status === 'published')).toBe(true);
    expect(published).toHaveLength(3);
  });

  it('TC-FR2-03: draft and suspended not in catalog', () => {
    const published = filterPublishedBooks(books);
    const ids = published.map((b) => b.id);
    expect(ids).not.toContain('book-draft-004');
    expect(ids).not.toContain('book-suspended-005');
  });

  it('TC-FR4-01: rent available when price_rent set', () => {
    expect(isRentAvailable(rentableBook)).toBe(true);
  });

  it('TC-FR4-02: rent not available when price_rent null', () => {
    expect(isRentAvailable(buyOnlyBook)).toBe(false);
  });

  it('TC-FR2-03: cannot view draft detail', () => {
    const draft = books.find((b) => b.status === 'draft')!;
    expect(canViewBookDetail(draft)).toBe(false);
  });

  it('TC-FR12: public book strips epub_key', () => {
    const pub = toPublicBook(rentableBook);
    expect(pub).not.toHaveProperty('epub_key');
    expect(pub.rentAvailable).toBe(true);
  });

  it('TC-FR3-01: search finds Thai title', () => {
    const results = searchBooks(books, 'กลิ่น');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(rentableBook.id);
  });

  it('TC-FR3-02: search returns empty for unknown query', () => {
    expect(searchBooks(books, 'xyznotexist999')).toHaveLength(0);
  });
});
