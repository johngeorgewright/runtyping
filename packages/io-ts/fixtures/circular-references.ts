import { array, intersection, literal, partial, recursion, type, Type, TypeOf, undefined as Undefined, union } from 'io-ts';
import { Student as _Student, Teacher as _Teacher } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/circular-references';

export const Teacher: Type<_Teacher> = recursion('Teacher', () => intersection([type({ type: literal("teacher"), }), partial({ students: union([array(Student), Undefined,]), reportsTo: union([Teacher, Undefined,]), })]));

export type Teacher = TypeOf<typeof Teacher>;

export const Student: Type<_Student> = recursion('Student', () => type({ type: literal("student"), teacher: Teacher, }));

export type Student = TypeOf<typeof Student>;

export const User = union([Student, Teacher,]);

export type User = TypeOf<typeof User>;
