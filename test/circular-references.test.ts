import generateFixture from './generateFixture'

test.only('circular references', async () => {
  expect((await generateFixture('circular-references', ['User'])).getText())
    .toMatchInlineSnapshot(`
    "import { Student as _Student, Teacher as _Teacher } from './circular-references';
    import { Runtype, Lazy, Record, Literal, Array, Static } from 'runtypes';

    export const Teacher: Runtype<_Teacher> = Lazy(() => Record({ type: Literal(\\"teacher\\"), students: Array(Student), }));

    export type Teacher = Static<typeof Teacher>;

    export const Student: Runtype<_Student> = Lazy(() => Record({ type: Literal(\\"student\\"), teacher: Teacher, }));

    export type Student = Static<typeof Student>;

    export const User = Student.Or(Teacher);

    export type User = Static<typeof User>;
    "
  `)
})
