interface PaginationOptions {
  page: number
  limit: number
  maxLimit?: number
}

interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export class Paginator<T> {
  private data: T[]
  private total: number
  private page: number
  private limit: number

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data
    this.total = meta.total
    this.page = meta.page
    this.limit = meta.limit
  }

  getResult(): PaginatedResult<T> {
    const totalPages = Math.ceil(this.total / this.limit)
    
    return {
      data: this.data,
      pagination: {
        page: this.page,
        limit: this.limit,
        total: this.total,
        totalPages,
        hasNext: this.page < totalPages,
        hasPrev: this.page > 1,
      },
    }
  }

  static create<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const { page, limit, maxLimit = 100 } = options
    const safeLimit = Math.min(limit, maxLimit)
    const safePage = Math.max(1, page)

    return new Paginator(data, {
      total,
      page: safePage,
      limit: safeLimit,
    }).getResult()
  }
}

// Utility functions for pagination
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 20
): PaginationOptions {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || defaultLimit.toString(), 10))
  )

  return { page, limit }
}

export function createPaginationLinks(
  baseUrl: string,
  pagination: {
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  },
  additionalParams?: Record<string, string>
): {
  first?: string
  prev?: string
  next?: string
  last?: string
} {
  const params = new URLSearchParams(additionalParams)
  const links: Record<string, string> = {}

  if (pagination.hasPrev) {
    params.set('page', '1')
    links.first = `${baseUrl}?${params.toString()}`
    
    params.set('page', (pagination.page - 1).toString())
    links.prev = `${baseUrl}?${params.toString()}`
  }

  if (pagination.hasNext) {
    params.set('page', (pagination.page + 1).toString())
    links.next = `${baseUrl}?${params.toString()}`
    
    params.set('page', pagination.totalPages.toString())
    links.last = `${baseUrl}?${params.toString()}`
  }

  return links
}

// React hook for pagination
export function usePagination<T>(
  data: T[],
  options: PaginationOptions
): PaginatedResult<T> {
  const { page, limit } = options
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = data.slice(startIndex, endIndex)

  return Paginator.create(paginatedData, data.length, options)
}

// Database pagination helper
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

// Cursor-based pagination for real-time data
export interface CursorPaginationOptions {
  cursor?: string
  limit: number
  direction: 'forward' | 'backward'
}

export interface CursorPaginatedResult<T> {
  data: T[]
  nextCursor?: string
  prevCursor?: string
  hasMore: boolean
}

export class CursorPaginator<T> {
  private data: T[]
  private cursor: string | undefined
  private limit: number
  private direction: 'forward' | 'backward'

  constructor(
    data: T[],
    cursor: string | undefined,
    limit: number,
    direction: 'forward' | 'backward' = 'forward'
  ) {
    this.data = data
    this.cursor = cursor
    this.limit = limit
    this.direction = direction
  }

  getResult(): CursorPaginatedResult<T> {
    // This is a simplified implementation
    // In a real app, you'd use the cursor to determine the slice
    const hasMore = this.data.length > this.limit
    const resultData = hasMore ? this.data.slice(0, this.limit) : this.data

    return {
      data: resultData,
      nextCursor: hasMore ? 'next-cursor' : undefined,
      prevCursor: this.cursor || undefined,
      hasMore,
    }
  }
}
