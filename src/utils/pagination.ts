const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Lê `?page=&limit=` da query string. Valores ausentes ou inválidos caem no padrão
 * (page 1, limit 10); o limit é limitado a 50 para evitar respostas gigantes.
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  return {
    page: toPositiveInt(query.page, DEFAULT_PAGE),
    limit: Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT),
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams,
): PaginatedResult<T> {
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}
