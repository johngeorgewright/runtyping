import { infer as Infer, object, instanceof as InstanceOf } from 'zod'

export const A = object({ a: InstanceOf(Uint8Array) })

export type A = Infer<typeof A>
