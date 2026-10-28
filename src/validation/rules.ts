export const isGeorgianPhone = (value: string) => /^(\+995)?\d{9}$/.test(value.replace(/[\s\-()]/g, ''))
export const isFullName = (value: string) => /^\S+(\s+\S+)+$/.test(value.trim())
