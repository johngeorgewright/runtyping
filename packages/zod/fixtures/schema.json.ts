import { literal, number, object, output, string, undefined as Undefined } from 'zod';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const ExampleSchema = object({ firstName: string(), lastName: string(), age: number().or(Undefined()).optional(), hairColor: literal("black").or(literal("brown")).or(literal("blue")).or(Undefined()).optional(), });

export type ExampleSchema = output<typeof ExampleSchema>;
