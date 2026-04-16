const LOG_PREFIX = '[portfolio]' as const
const isDev = import.meta.env.DEV

/**
 * Small structured logger: verbose in development, quieter in production.
 * Replace `console.*` calls in app code with these methods for consistent tagging.
 */
export const logger = {
  debug(message: string, ...details: unknown[]) {
    if (isDev) console.debug(LOG_PREFIX, message, ...details)
  },
  info(message: string, ...details: unknown[]) {
    if (isDev) console.info(LOG_PREFIX, message, ...details)
  },
  warn(message: string, ...details: unknown[]) {
    console.warn(LOG_PREFIX, message, ...details)
  },
  error(message: string, ...details: unknown[]) {
    console.error(LOG_PREFIX, message, ...details)
  },
}
