import * as pathHelper from 'path'
import Generator from '../src/Generator'

test('json schema', async () => {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `maxItems.schema.runtypes.ts`),
  })

  const file = await generator.generate({
    file: pathHelper.join(__dirname, 'maxItems.schema.json'),
    type: 'ExampleSchema',
  })

  expect(file!.getText()).toMatchInlineSnapshot(`
    "import { Record, Tuple, Dictionary, String, Unknown, Undefined, Static } from 'runtypes';

    export const ExampleSchema = Record({ testArray: Tuple().Or(Tuple(Dictionary(Unknown, String),)).Or(Tuple(Dictionary(Unknown, String), Dictionary(Unknown, String),)).Or(Undefined).optional(), });

    export type ExampleSchema = Static<typeof ExampleSchema>;
    "
  `)
})
