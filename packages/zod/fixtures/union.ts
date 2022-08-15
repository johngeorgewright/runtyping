import { infer as Infer, string, number } from 'zod'

export const C = string().or(number())

export type C = Infer<typeof C>
