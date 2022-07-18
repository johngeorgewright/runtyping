import * as pathHelper from 'path'
import Generator from '../Generator'
import { fixturesDir } from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function minItemsTypeWriterTest(props: TypeWriterTestProps) {
  test('json schema', async () => {
    const generator = new Generator({
      ...props,
      targetFile: pathHelper.join(fixturesDir, `minItems.schema.runtypes.ts`),
    })

    const file = await generator.generate([
      {
        file: pathHelper.join(fixturesDir, 'minItems.schema.json'),
        type: 'ExampleSchema',
      },
    ])

    expect(file!.getText()).toMatchSnapshot()
  })
}
