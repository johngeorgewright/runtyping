import { string, type, Type, TypeOf } from 'io-ts';

export const A = <T extends any,>(T: Type<T>,) => type({ type: T, });

export type A<T> = TypeOf<ReturnType<typeof A<T>>>;

export const B = <T extends string,>(T: Type<T>,) => type({ type: T, });

export type B<T extends string> = TypeOf<ReturnType<typeof B<T>>>;

export const C = <T extends any,>(T: Type<T>,) => type({ type: T, });

export type C<T> = TypeOf<ReturnType<typeof C<T>>>;

export const D = <T extends number,>(T: Type<T>,) => type({ type: T, });

export type D<T extends number> = TypeOf<ReturnType<typeof D<T>>>;

export const E = type({ foo: string, });

export type E = TypeOf<typeof E>;

export const F = <T extends TypeOf<typeof E>,>(T: Type<T>,) => type({ type: T, });

export type F<T extends E> = TypeOf<ReturnType<typeof F<T>>>;
