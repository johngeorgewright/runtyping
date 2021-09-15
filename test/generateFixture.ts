import * as pathHelper from 'path'
import { Project } from 'ts-morph'
import Generator from '../src/Generator'

export default async function generateFixture(
  name: string,
  types: string[],
  project?: Project
) {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
    project,
  })

  return generator.generate([
    {
      file: pathHelper.join(__dirname, `${name}.ts`),
      type: types,
    },
  ])
}
