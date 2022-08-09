import * as pathHelper from 'path'
import { Generator } from '@runtyping/generator'
import { fixturesSourceDir } from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function minItemsTypeWriterTest(props: TypeWriterTestProps) {
  test('json schema', async () => {
    const generator = new Generator({
      ...props,
      targetFile: pathHelper.join(
        fixturesSourceDir,
        `minItems.schema.runtypes.ts`
      ),
    })

    const file = await generator.generate([
      {
        file: pathHelper.join(fixturesSourceDir, 'minItems.schema.json'),
        type: 'ExampleSchema',
      },
    ])

    expect(file!.getText()).toMatchSnapshot()
  })
}
