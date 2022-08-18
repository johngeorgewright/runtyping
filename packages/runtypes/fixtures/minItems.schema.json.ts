import { Array, Dictionary, Record, Static, String, Undefined, Unknown } from 'runtypes';

export const ExampleSchema = Record({ testArray: Array(Dictionary(Unknown, String)).withConstraint(t => t.length >= 2).Or(Undefined).optional(), });

export type ExampleSchema = Static<typeof ExampleSchema>;
