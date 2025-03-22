import { custom, InferOutput, intersect, object, optional, record, strictTuple, string, undefined as Undefined, union, unknown } from 'valibot';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const ExampleSchema = object({ testArray: optional(union([strictTuple([]), strictTuple([intersect([record(string(), unknown()), custom((data) => !Array.isArray(data), "Unexpected array")]),]), strictTuple([intersect([record(string(), unknown()), custom((data) => !Array.isArray(data), "Unexpected array")]), intersect([record(string(), unknown()), custom((data) => !Array.isArray(data), "Unexpected array")]),]), Undefined()])), });

export type ExampleSchema = InferOutput<typeof ExampleSchema>;
