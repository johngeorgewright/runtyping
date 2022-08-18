import { infer as Infer, literal, number, object, string, undefined as Undefined } from 'zod';

export const ExampleSchema = object({ firstName: string(), lastName: string(), age: number().or(Undefined()).optional(), hairColor: literal("black").or(literal("brown")).or(literal("blue")).or(Undefined()).optional(), });

export type ExampleSchema = Infer<typeof ExampleSchema>;
