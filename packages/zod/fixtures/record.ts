import { infer as Infer, record, string } from 'zod'

export const A = record(string(), string())

export type A = Infer<typeof A>
