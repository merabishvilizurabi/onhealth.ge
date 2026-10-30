import { useState } from 'react'

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, pageCount)

  return {
    page: current,
    pageCount,
    pageItems: items.slice((current - 1) * pageSize, current * pageSize),
    setPage,
  }
}
