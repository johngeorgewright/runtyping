import * as pathHelper from 'path'
import { Project } from 'ts-morph'
import { Generator, GeneratorOptions, TypeWriters } from '@runtyping/generator'
import * as ts from 'typescript'

export const fixturesDir = pathHelper.resolve(__dirname, '..', 'fixtures')

export default async function generateFixture(
  name: string,
  types: string[],
  {
    exportStaticType,
    generatorOpts,
    module,
    project,
    typeWriters,
  }: {
    exportStaticType?: boolean
    generatorOpts?: Partial<GeneratorOptions>
    module: string
    project?: Project
    typeWriters: TypeWriters
  }
) {
  const generator = new Generator({
    typeWriters,
    module,
    targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
    project,
    ...generatorOpts,
  })

  const sourceFile = await generator.generate([
    {
      exportStaticType,
      file: pathHelper.join(fixturesDir, `${name}.ts`),
      type: types,
    },
  ])

  const js = ts.transpile(sourceFile.getText())

  try {
    eval(js)
  } catch (error: any) {
    const message =
      error.message +
      `

=== TS ===
// ${sourceFile.getFilePath()}
${sourceFile.getText()}

=== JS ===
${js}
`
    throw new Error(message)
  }

  return sourceFile
}
