import { infer as Infer, object, record, string, tuple, undefined as Undefined, unknown as Unknown } from 'zod';

export const ExampleSchema = object({ testArray: tuple([]).or(tuple([record(string(), Unknown()),])).or(tuple([record(string(), Unknown()), record(string(), Unknown()),])).or(Undefined()).optional(), });

export type ExampleSchema = Infer<typeof ExampleSchema>;
