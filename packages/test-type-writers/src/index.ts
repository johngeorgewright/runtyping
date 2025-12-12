import { expect, test } from 'vitest'
import { Generator } from '@runtyping/generator'
import * as pathHelper from 'path'
import { readdirSync } from 'fs'
import { basename } from 'path'
import {
  fixturesDataDir,
  fixturesDestDir,
  fixturesSourceDir,
  testFixture,
} from './fixture'
import { TypeWriterTestProps } from './types'

const testNames = readdirSync(fixturesDataDir).map((filename) =>
  basename(filename, '.ts'),
)

export default function testTypeWriters<Validator>(
  props: TypeWriterTestProps<Validator>,
) {
  for (const testName of testNames)
    test(testName, () => testFixture(testName, props))

  test('without static types', async () => {
    const generator = new Generator({
      typeWriters: props.typeWriters,
      targetFile: pathHelper.join(fixturesDestDir, 'without-static-types.ts'),
      transformers: {
        TransformStringToNumber: {
          file: '@runtyping/test-type-writers/transformers/stringToNumber',
          export: 'stringToNumber',
        },
      },
    })
    const sourceFile = await generator.generate([
      {
        exportStaticType: false,
        file: pathHelper.join(fixturesSourceDir, 'without-static-types.ts'),
        type: ['One', 'Two', 'Three'],
      },
    ])
    expect(sourceFile.getText()).toMatchSnapshot()
  })
}
