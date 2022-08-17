import { TypeOf, intersection, type, string, partial, union, number, undefined as Undefined, literal } from 'io-ts';

export const ExampleSchema = intersection([type({ firstName: string, lastName: string, }), partial({ age: union([number, Undefined,]), hairColor: union([literal("black"), literal("brown"), literal("blue"), Undefined,]), })]);

export type ExampleSchema = TypeOf<typeof ExampleSchema>;
