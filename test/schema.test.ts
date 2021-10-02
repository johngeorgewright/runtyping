import * as pathHelper from 'path'
import Generator from '../src/Generator'

test('json schema', async () => {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `schema.runtypes.ts`),
  })

  const file = await generator.generate({
    file: pathHelper.join(__dirname, 'schema.json'),
    type: 'ExampleSchema',
  })

  expect(file!.getText()).toMatchInlineSnapshot(`
    "import { Record, String, Number, Undefined, Literal, Static } from 'runtypes';

    export const ExampleSchema = Record({ firstName: String, lastName: String, age: Number.Or(Undefined).optional(), hairColor: Literal(\\"black\\").Or(Literal(\\"brown\\")).Or(Literal(\\"blue\\")).Or(Undefined).optional(), });

    export type ExampleSchema = Static<typeof ExampleSchema>;
    "
  `)
})
