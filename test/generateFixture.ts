import * as pathHelper from 'path'
import { Project } from 'ts-morph'
import Generator, { GeneratorOptions } from '../src/Generator'

export default async function generateFixture(
  name: string,
  types: string[],
  {
    exportStaticType,
    generatorOpts,
    project,
  }: {
    exportStaticType?: boolean
    project?: Project
    generatorOpts?: Partial<GeneratorOptions>
  } = {}
) {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
    project,
    ...generatorOpts,
  })

  return generator.generate([
    {
      exportStaticType,
      file: pathHelper.join(__dirname, `${name}.ts`),
      type: types,
    },
  ])
}
