import * as pathHelper from 'path'
import { Project, SourceFile } from 'ts-morph'
import { Generator, GeneratorOptions, TypeWriters } from '@runtyping/generator'
import * as ts from 'typescript'
import { temporaryWriteTask } from './temp'
import { TypeWriterTestProps } from './types'

export const fixturesDir = pathHelper.resolve(__dirname, '..', 'fixtures')

export const fixturesSourceDir = pathHelper.join(fixturesDir, 'source')

export const fixturesDataDir = pathHelper.join(fixturesDir, 'data')

interface TestFixtureProps extends TypeWriterTestProps {
  exportStaticType?: boolean
  generatorOpts?: Partial<GeneratorOptions>
  project?: Project
}

export default async function testFixture(
  name: string,
  types: string[],
  props: TestFixtureProps
) {
  const sourceFile = await generate(name, types, props)
  await validate(name, types, sourceFile, props.validate)
  return sourceFile
}

async function generate(
  name: string,
  types: string[],
  {
    exportStaticType,
    generatorOpts,
    project,
    typeWriters,
  }: {
    exportStaticType?: boolean
    generatorOpts?: Partial<GeneratorOptions>
    project?: Project
    typeWriters: TypeWriters
  }
) {
  const generator = new Generator({
    typeWriters,
    targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
    project,
    ...generatorOpts,
  })

  const sourceFile = await generator.generate([
    {
      exportStaticType,
      file: pathHelper.join(fixturesSourceDir, `${name}.ts`),
      type: types,
    },
  ])

  const js = ts.transpile(sourceFile.getText())

  try {
    eval(js)
  } catch (error: any) {
    const message = `
${error.message}
${error.stack}

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

async function validate(
  name: string,
  types: string[],
  sourceFile: SourceFile,
  validate: TestFixtureProps['validate']
) {
  const data = await import(pathHelper.join(fixturesDataDir, `${name}.ts`))

  await temporaryWriteTask(
    sourceFile.getText(),
    async (path) => {
      const validators = await import(path)
      for (const type of types) {
        for (const testData of data[type].success)
          try {
            validate(validators[type], testData)
          } catch (error: any) {
            throw new ExpectedSuccess(name, type, error)
          }

        for (const testData of data[type].failure)
          try {
            validate(validators[type], testData)
            throw new ExpectedFailure(name, type)
          } catch (error) {
            if (error instanceof ExpectedFailure) throw error
          }
      }
    },
    { extension: 'ts' }
  )
}

class ExpectedFailure extends Error {
  constructor(public readonly testName: string, public readonly type: string) {
    super(`Expected failure for ${testName}.${type}`)
  }
}

class ExpectedSuccess extends Error {
  constructor(
    public readonly testName: string,
    public readonly type: string,
    error: Error
  ) {
    super(`Expected success for ${testName}.${type}\n\n${error.message}`)
  }
}
