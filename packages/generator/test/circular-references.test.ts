import generateFixture from './generateFixture'

let warn: jest.Mock<void>
let consoleWarn = console.warn

beforeEach(() => {
  warn = jest.fn()
  console.warn = warn
})

afterEach(() => {
  console.warn = consoleWarn
})

test('circular references', async () => {
  expect((await generateFixture('circular-references', ['User'])).getText())
    .toMatchInlineSnapshot(`
    "import { Student as _Student, Teacher as _Teacher } from './circular-references';
    import { Lazy, Runtype, Record, Literal, Array, Static } from 'runtypes';

    export const Teacher: Runtype<_Teacher> = Lazy(() => Record({ type: Literal(\\"teacher\\"), students: Array(Student), reportsTo: Teacher, }));

    export type Teacher = Static<typeof Teacher>;

    export const Student: Runtype<_Student> = Lazy(() => Record({ type: Literal(\\"student\\"), teacher: Teacher, }));

    export type Student = Static<typeof Student>;

    export const User = Student.Or(Teacher);

    export type User = Static<typeof User>;
    "
  `)

  expect(warn.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Spotted a circular reference between \`Teacher\` and \`Student\`. This may cause infinite loops at runtime.",
      ],
      Array [
        "Spotted a circular reference between \`Student\` and \`Teacher\`. This may cause infinite loops at runtime.",
      ],
    ]
  `)
})
