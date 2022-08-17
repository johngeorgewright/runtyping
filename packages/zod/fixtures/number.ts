import { infer as Infer, number } from 'zod';

export const A = number();

export type A = Infer<typeof A>;
