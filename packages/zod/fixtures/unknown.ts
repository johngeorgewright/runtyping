import { any as Any, infer as Infer, unknown as Unknown } from 'zod';

export const A = Any();

export type A = Infer<typeof A>;

export const B = Unknown();

export type B = Infer<typeof B>;
