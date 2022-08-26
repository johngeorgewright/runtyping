import { infer as Infer, null as Null, object, string, undefined as Undefined } from 'zod';

export const A = Null();

export type A = Infer<typeof A>;

export const B = Null().or(string());

export type B = Infer<typeof B>;

export const C = object({ a: Null(), b: Null().or(string()), c: Null().or(string()).or(Undefined()).optional(), });

export type C = Infer<typeof C>;
