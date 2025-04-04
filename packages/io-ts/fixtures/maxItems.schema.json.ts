import { partial, record, string, tuple, TypeOf, undefined as Undefined, union, unknown as Unknown } from 'io-ts';
import { validators } from '@runtyping/io-ts';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const ExampleSchema = partial({ testArray: union([validators.emptyTuple, validators.arrayOfLength<[unknown]>(1).pipe(tuple([record(string, Unknown),])), validators.arrayOfLength<[unknown, unknown]>(2).pipe(tuple([record(string, Unknown), record(string, Unknown),])), Undefined,]), });

export type ExampleSchema = TypeOf<typeof ExampleSchema>;
