import { TypeOf, partial, union, tuple, string, record, unknown as Unknown, undefined as Undefined } from 'io-ts';

export const ExampleSchema = partial({ testArray: union([tuple([record(string, Unknown),]), Undefined,]), });

export type ExampleSchema = TypeOf<typeof ExampleSchema>;
