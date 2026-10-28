const normalize = (value: string) => value.trim().toLowerCase()

// True when the query is empty or any of the fields contains it
export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = normalize(query)
  return q === '' || fields.some((field) => normalize(field).includes(q))
}
