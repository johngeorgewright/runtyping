import { Dictionary, Record, Static, String, Tuple, Undefined, Unknown } from 'runtypes';

export const ExampleSchema = Record({ testArray: Tuple().Or(Tuple(Dictionary(Unknown, String),)).Or(Tuple(Dictionary(Unknown, String), Dictionary(Unknown, String),)).Or(Undefined).optional(), });

export type ExampleSchema = Static<typeof ExampleSchema>;
