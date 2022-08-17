import { Static, Record, String, Number, Undefined, Literal } from 'runtypes';

export const ExampleSchema = Record({ firstName: String, lastName: String, age: Number.Or(Undefined).optional(), hairColor: Literal("black").Or(Literal("brown")).Or(Literal("blue")).Or(Undefined).optional(), });

export type ExampleSchema = Static<typeof ExampleSchema>;
