import { infer as Infer, null as Null, object, string } from 'zod';

export const FooType = Null().or(string());

export type FooType = Infer<typeof FooType>;

export const HorseType = object({ a: FooType, b: FooType, });

export type HorseType = Infer<typeof HorseType>;
