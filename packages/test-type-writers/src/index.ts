import { readdirSync } from 'fs'
import { basename } from 'path'
import { fixturesDataDir, testFixture } from './fixture'
import { TypeWriterTestProps } from './types'

const testNames = readdirSync(fixturesDataDir).map((filename) =>
  basename(filename, '.ts')
)

export default function testTypeWriters<Validator>(
  props: TypeWriterTestProps<Validator>
) {
  for (const testName of testNames)
    test(testName, () => testFixture(testName, props))
}
