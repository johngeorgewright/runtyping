import { infer as Infer, ZodType, object, string } from 'zod';

export const A = <T extends any,>(T: ZodType<T>,) => object({ type: T, });

export type A<T> = Infer<ReturnType<typeof A<T>>>;

export const B = <T extends string,>(T: ZodType<T>,) => object({ type: T, });

export type B<T extends string> = Infer<ReturnType<typeof B<T>>>;

export const C = <T extends any,>(T: ZodType<T>,) => object({ type: T, });

export type C<T> = Infer<ReturnType<typeof C<T>>>;

export const D = <T extends number,>(T: ZodType<T>,) => object({ type: T, });

export type D<T extends number> = Infer<ReturnType<typeof D<T>>>;

export const E = object({ foo: string(), });

export type E = Infer<typeof E>;

export const F = <T extends Infer<typeof E>,>(T: ZodType<T>,) => object({ type: T, });

export type F<T extends E> = Infer<ReturnType<typeof F<T>>>;
