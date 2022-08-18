import { Array, Dictionary, Record, Static, String, Undefined, Unknown } from 'runtypes';

export const ExampleSchema = Record({
  testArray: Array(Unknown).withConstraint<[{ [k: string]: unknown; }, { [k: string]: unknown; }, ...{ [k: string]: unknown; }[]]>(data =>
    data.length >= 2
    && Dictionary(Unknown, String).guard(data[0])
    && Dictionary(Unknown, String).guard(data[1])
    && Array(Dictionary(Unknown, String)).guard(data.slice(2, undefined))
  ).Or(Undefined).optional(),
});

export type ExampleSchema = Static<typeof ExampleSchema>;
