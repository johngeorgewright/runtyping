import { array, GenericSchema, InferOutput, lazy, literal, object, optional, undefined as Undefined, union } from 'valibot';
import { Student as _Student, Teacher as _Teacher } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/circular-references';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const Teacher: GenericSchema<_Teacher> = lazy(() => object({ type: literal("teacher"), students: optional(union([array(Student), Undefined()])), reportsTo: optional(union([Teacher, Undefined()])), }));

export type Teacher = InferOutput<typeof Teacher>;

export const Student: GenericSchema<_Student> = lazy(() => object({ type: literal("student"), teacher: Teacher, }));

export type Student = InferOutput<typeof Student>;

export const User = union([Student, Teacher]);

export type User = InferOutput<typeof User>;
