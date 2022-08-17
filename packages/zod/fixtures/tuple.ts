import { infer as Infer, tuple, number, string } from 'zod'

export const A = tuple([number(), string(), number()])

export type A = Infer<typeof A>

export const B = tuple([A, A])

export type B = Infer<typeof B>