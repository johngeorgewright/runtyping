import { partial, record, string, tuple, TypeOf, undefined as Undefined, union, unknown as Unknown } from 'io-ts';

export const ExampleSchema = partial({ testArray: union([tuple([record(string, Unknown), record(string, Unknown),]), Undefined,]), });

export type ExampleSchema = TypeOf<typeof ExampleSchema>;
