import { infer as Infer, literal, number, object, string } from 'zod';

export const C = object({ bar: string(), foo: string(), });

export type C = Infer<typeof C>;

export const D = object({ bar: number(), moo: string(), foo: number(), car: string(), });

export type D = Infer<typeof D>;

export const E = object({ imported: literal(true), });

export type E = Infer<typeof E>;
