import * as pathHelper from 'path'
import { Generator } from '@runtyping/generator'
import { fixturesSourceDir } from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function maxItemsTypeWriterTest({
  typeWriters,
}: TypeWriterTestProps) {
  test('json schema', async () => {
    const generator = new Generator({
      targetFile: pathHelper.join(
        fixturesSourceDir,
        `maxItems.schema.runtypes.ts`
      ),
      typeWriters,
    })

    const file = await generator.generate({
      file: pathHelper.join(fixturesSourceDir, 'maxItems.schema.json'),
      type: 'ExampleSchema',
    })

    expect(file!.getText()).toMatchSnapshot()
  })
}
