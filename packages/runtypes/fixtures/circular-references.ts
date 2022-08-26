import { Array, Lazy, Literal, Record, Runtype, Static, Undefined } from 'runtypes';
import { Student as _Student, Teacher as _Teacher } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/circular-references';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const Teacher: Runtype<_Teacher> = Lazy(() => Record({ type: Literal("teacher"), students: Array(Student).Or(Undefined).optional(), reportsTo: Teacher.Or(Undefined).optional(), }));

export type Teacher = Static<typeof Teacher>;

export const Student: Runtype<_Student> = Lazy(() => Record({ type: Literal("student"), teacher: Teacher, }));

export type Student = Static<typeof Student>;

export const User = Student.Or(Teacher);

export type User = Static<typeof User>;
