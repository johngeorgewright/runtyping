import * as pathHelper from 'path'
import generate from '../src/generate'
import { accumulate } from '@johngw/async-iterator'

export default async function generateFixture(name: string, types: string[]) {
  const [file] = await accumulate(
    generate({
      buildInstructions: [
        {
          targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
          sourceTypes: [
            {
              file: pathHelper.join(__dirname, `${name}.ts`),
              type: types,
            },
          ],
        },
      ],
    })
  )

  return file
}
