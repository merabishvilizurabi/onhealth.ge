const normalize = (value: string) => value.trim().toLowerCase()

export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = normalize(query)
  return q === '' || fields.some((field) => normalize(field).includes(q))
}
