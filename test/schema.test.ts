import * as pathHelper from 'path'
import { SourceFile } from 'ts-morph'
import generate from '../src/generate'

test('json schema', async () => {
  let file: SourceFile

  for await (const _file of generate({
    buildInstructions: [
      {
        targetFile: pathHelper.join(__dirname, `schema.runtypes.ts`),
        sourceTypes: [
          {
            file: pathHelper.join(__dirname, 'schema.json'),
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
"import { Record, String, Number, Literal, Static } from 'runtypes';

export const ExampleSchema = Record({ firstName: String, lastName: String, age: Number, hairColor: Literal(\\"black\\").Or(Literal(\\"brown\\")).Or(Literal(\\"blue\\")), });

export type ExampleSchema = Static<typeof ExampleSchema>;
"
`)
})
