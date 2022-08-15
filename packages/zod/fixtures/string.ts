import { infer as Infer, string } from 'zod'

export const A = string()

export type A = Infer<typeof A>
