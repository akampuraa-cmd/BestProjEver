import { Knex } from 'knex';
import { PaginatedResponse, PaginationQuery } from '../types';

export function getPaginationParams(query: PaginationQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export async function paginate<T>(
  baseQuery: Knex.QueryBuilder,
  query: PaginationQuery
): Promise<PaginatedResponse<T>> {
  const { page, limit, offset } = getPaginationParams(query);

  const countQuery = baseQuery.clone().clearSelect().clearOrder().count('* as total').first();
  const countResult = await countQuery as { total: string } | undefined;
  const total = parseInt(countResult?.total || '0', 10);

  const data = await baseQuery.limit(limit).offset(offset) as T[];

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}
