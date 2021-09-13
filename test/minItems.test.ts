import * as pathHelper from 'path'
import Generator from '../src/Generator'

test('json schema', async () => {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `minItems.schema.runtypes.ts`),
  })

  const file = await generator.generate([
    {
      file: pathHelper.join(__dirname, 'minItems.schema.json'),
      type: 'ExampleSchema',
    },
  ])

  expect(file!.getText()).toMatchInlineSnapshot(`
"import { Record, Tuple, Dictionary, String, Unknown, Static } from 'runtypes';

export const ExampleSchema = Record({ testArray: Tuple(Dictionary(Unknown, String), Dictionary(Unknown, String), Dictionary(Unknown, String),).optional(), });

export type ExampleSchema = Static<typeof ExampleSchema>;
"
`)
})
