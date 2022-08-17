import { infer as Infer, array, string } from 'zod'

export const A = array(string()).min(1)

export type A = Infer<typeof A>
