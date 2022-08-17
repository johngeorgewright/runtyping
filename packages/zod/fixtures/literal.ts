import { infer as Infer, literal } from 'zod';

export const A = literal("foo");

export type A = Infer<typeof A>;

export const B = literal(2);

export type B = Infer<typeof B>;

export const C = literal(true);

export type C = Infer<typeof C>;
