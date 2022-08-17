import { infer as Infer, array, string, number, object } from 'zod'

export const A = object({ foo: string() })

export type A = Infer<typeof A>

export const B = array(string().or(number()).or(A))

export type B = Infer<typeof B>