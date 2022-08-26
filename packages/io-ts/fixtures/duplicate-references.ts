import { null as Null, string, type, TypeOf, union } from 'io-ts';

export const FooType = union([Null, string,]);

export type FooType = TypeOf<typeof FooType>;

export const HorseType = type({ a: FooType, b: FooType, });

export type HorseType = TypeOf<typeof HorseType>;
