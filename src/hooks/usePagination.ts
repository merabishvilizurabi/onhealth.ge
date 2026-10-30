import { useState } from 'react'

// Splits a list into pages. If the list gets shorter (e.g. a visit was cancelled),
// the page number is kept inside the new page count.
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
