import { boolean, infer as Infer } from 'zod';

export const A = boolean();

export type A = Infer<typeof A>;
