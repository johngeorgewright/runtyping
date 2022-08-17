import { ZodType } from 'zod'

export function zodGuard<T>(validator: ZodType<T>) {
  return (data: unknown): data is T => validator.safeParse(data).success
}
