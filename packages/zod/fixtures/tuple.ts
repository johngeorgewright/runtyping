import { infer as Infer, number, string, tuple } from 'zod';

export const A = tuple([number(), string(), number(),]);

export type A = Infer<typeof A>;

export const B = tuple([A, A,]);

export type B = Infer<typeof B>;

export const C = tuple([]);

export type C = Infer<typeof C>;
