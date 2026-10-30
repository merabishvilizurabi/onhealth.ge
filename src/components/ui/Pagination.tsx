interface PaginationProps {
  page: number // 1-based
  pageCount: number
  onChange: (page: number) => void
  label: string // what is being paged, for screen readers
}

const button = (active: boolean) =>
  `min-w-9 rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
    active ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
  }`

// ‹ 1 2 3 › — hidden when everything fits on one page
export function Pagination({ page, pageCount, onChange, label }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="წინა გვერდი" className={button(false)}>
        ‹
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          className={button(n === page)}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        aria-label="შემდეგი გვერდი"
        className={button(false)}
      >
        ›
      </button>
    </nav>
  )
}
