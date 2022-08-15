import { infer as Infer, boolean } from 'zod'

export const A = boolean()

export type A = Infer<typeof A>
