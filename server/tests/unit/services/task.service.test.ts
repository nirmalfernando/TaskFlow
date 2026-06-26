import { buildPaginationMeta } from '../../../src/utils/response';

describe('buildPaginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta(100, 1, 20);
    expect(meta.totalPages).toBe(5);
    expect(meta.total).toBe(100);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
  });

  it('hasNext true when not on last page', () => {
    const meta = buildPaginationMeta(100, 1, 20);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(false);
  });

  it('hasPrev true when not on first page', () => {
    const meta = buildPaginationMeta(100, 3, 20);
    expect(meta.hasPrev).toBe(true);
    expect(meta.hasNext).toBe(true);
  });

  it('hasNext false on last page', () => {
    const meta = buildPaginationMeta(100, 5, 20);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });

  it('handles partial last page', () => {
    const meta = buildPaginationMeta(21, 2, 20);
    expect(meta.totalPages).toBe(2);
    expect(meta.hasNext).toBe(false);
  });

  it('handles empty result set', () => {
    const meta = buildPaginationMeta(0, 1, 20);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });
});
