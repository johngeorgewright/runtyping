import { TypeOf, type, union, null as Null, string } from 'io-ts';

export const FooType = union([Null, string,]);

export type FooType = TypeOf<typeof FooType>;

export const HorseType = type({ a: FooType, b: FooType, });

export type HorseType = TypeOf<typeof HorseType>;
