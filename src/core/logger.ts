export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const levelOrder: Record<Exclude<LogLevel, 'silent'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function readLevel(): LogLevel {
  const raw = import.meta.env.VITE_LOG_LEVEL
  if (!raw) return 'info'
  if (raw === 'silent') return 'silent'
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw
  return 'info'
}

function shouldLog(current: LogLevel, target: Exclude<LogLevel, 'silent'>): boolean {
  if (current === 'silent') return false
  return levelOrder[target] >= levelOrder[current]
}

export const logger = {
  debug: (...args: unknown[]) => {
    const level = readLevel()
    if (!shouldLog(level, 'debug')) return
    console.debug('[debug]', ...args)
  },
  info: (...args: unknown[]) => {
    const level = readLevel()
    if (!shouldLog(level, 'info')) return
    console.info('[info]', ...args)
  },
  warn: (...args: unknown[]) => {
    const level = readLevel()
    if (!shouldLog(level, 'warn')) return
    console.warn('[warn]', ...args)
  },
  error: (...args: unknown[]) => {
    const level = readLevel()
    if (!shouldLog(level, 'error')) return
    console.error('[error]', ...args)
  },
}
