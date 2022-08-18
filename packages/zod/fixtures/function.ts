import { function as func, infer as Infer } from 'zod';

export const A = func();

export type A = Infer<typeof A>;
