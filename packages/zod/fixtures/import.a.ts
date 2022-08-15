import { infer as Infer, object, string } from 'zod'

export const A = object({ foo: string() })

export type A = Infer<typeof A>
