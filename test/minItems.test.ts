import * as pathHelper from 'path'
import { SourceFile } from 'ts-morph'
import generate from '../src/generate'

test('json schema', async () => {
  let file: SourceFile

  for await (const _file of generate({
    buildInstructions: [
      {
        targetFile: pathHelper.join(__dirname, `minItems.schema.runtypes.ts`),
        sourceTypes: [
          {
            file: pathHelper.join(__dirname, 'minItems.schema.json'),
            type: 'ExampleSchema',
          },
        ],
      },
    ],
  })) {
    file = _file
    break
  }

  expect(file!.getText()).toMatchInlineSnapshot(`
"import { Record, Tuple, Dictionary, String, Unknown, Undefined, Static } from 'runtypes';

export const ExampleSchema = Record({ testArray: Tuple(Dictionary(Unknown, String), Dictionary(Unknown, String), Dictionary(Unknown, String),).Or(Undefined), });

export type ExampleSchema = Static<typeof ExampleSchema>;
"
`)
})
