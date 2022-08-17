import { infer as Infer, function as func } from 'zod';

export const A = func();

export type A = Infer<typeof A>;
