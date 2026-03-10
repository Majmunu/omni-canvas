export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
