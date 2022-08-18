import { partial, record, string, tuple, TypeOf, undefined as Undefined, union, unknown as Unknown } from 'io-ts';
import { validators } from '@runtyping/io-ts';

export const ExampleSchema = partial({ testArray: union([validators.emptyTuple, validators.arrayOfLength<[unknown]>(1).pipe(tuple([record(string, Unknown),])), validators.arrayOfLength<[unknown, unknown]>(2).pipe(tuple([record(string, Unknown), record(string, Unknown),])), Undefined,]), });

export type ExampleSchema = TypeOf<typeof ExampleSchema>;