import { infer as Infer, object, string, undefined as Undefined } from 'zod'

export const A = object({ foo: string().or(Undefined()).optional() })

export type A = Infer<typeof A>
