export function getPageCount(total: number, pageSize: number): number {
  if (total === 0) {
    return 1;
  }

  return Math.ceil(total / pageSize);
}

export function getPageRange(
  page: number,
  pageSize: number,
  total: number,
): { start: number; end: number } {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}
