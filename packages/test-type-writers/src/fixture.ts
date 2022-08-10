import mkdirp from 'mkdirp'
import * as pathHelper from 'path'
import { Project, SourceFile } from 'ts-morph'
import { Generator, GeneratorOptions, TypeWriters } from '@runtyping/generator'
import ts from 'typescript'
import {
  TestData,
  TestDataCall,
  TestDataFailure,
  TestDataFn,
  TestDataNamespace,
  TestDataSuccess,
  TypeWriterTestProps,
} from './types'
import { ExpectedFailure, ExpectedSuccess } from './error'
import { writeFile } from 'fs/promises'

export const fixturesDir = pathHelper.resolve(__dirname, '..', 'fixtures')

export const fixturesSourceDir = pathHelper.join(fixturesDir, 'source')

export const fixturesDataDir = pathHelper.join(fixturesDir, 'data')

export const fixturesDestDir = `${process.cwd()}/fixtures`

interface TestFixtureProps extends TypeWriterTestProps {
  exportStaticType?: boolean
  generatorOpts?: Partial<GeneratorOptions>
  project?: Project
}

export async function testFixture(testName: string, props: TestFixtureProps) {
  await mkdirp(fixturesDestDir)
  const dataNames = await getDataNames(testName)
  const sourceFile = await generate(testName, dataNames, props)
  await validate(testName, dataNames, sourceFile, props)
}

async function getDataNames(testName: string): Promise<string[]> {
  const $getDataNames = (data: any): string[] => {
    const names = Object.keys(data)
    return names.flatMap((name) =>
      typeof data[name] === 'object' && data[name].$namespace
        ? $getDataNames(data[name])
            .filter((x) => x !== '$namespace')
            .map((x) => `${name}.${x}`)
        : name
    )
  }
  return $getDataNames(
    await import(pathHelper.join(fixturesDataDir, `${testName}.ts`))
  )
}

async function generate(
  testName: string,
  dataNames: string[],
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
    targetFile: pathHelper.join(fixturesDestDir, `${testName}.ts`),
    project,
    ...generatorOpts,
  })

  const sourceFile = await generator.generate([
    {
      exportStaticType,
      file: pathHelper.join(fixturesSourceDir, `${testName}.ts`),
      type: dataNames,
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
  testName: string,
  dataNames: string[],
  sourceFile: SourceFile,
  props: TestFixtureProps
) {
  const data = await import(pathHelper.join(fixturesDataDir, `${testName}.ts`))

  await writeFile(sourceFile.getFilePath(), sourceFile.getText())

  let validators: any
  try {
    validators = await import(sourceFile.getFilePath())
  } catch (error) {
    throw error
  }

  for (const type of dataNames) {
    for (const testData of getSuccess(data[type]))
      try {
        validateData(validators[type], testData, props)
      } catch (error: any) {
        throw new ExpectedSuccess(testName, type, testData, error)
      }

    for (const testData of getFailure(data[type]))
      try {
        validateData(validators[type], testData, props)
        throw new ExpectedFailure(testName, type, testData)
      } catch (error) {
        if (error instanceof ExpectedFailure) throw error
      }
  }
}

function* getSuccess<T>(
  data: TestData<T> | TestDataNamespace<Record<string, T>>
): Iterable<TestDataSuccess<T>> {
  const testData = TestData<T>().safeParse(data)
  if (testData.success) return yield* testData.data.success
  for (const key in data)
    yield* getSuccess((data as TestDataNamespace<Record<string, T>>)[key])
}

function* getFailure<T>(
  data: TestData<T> | TestDataNamespace<Record<string, T>>
): Iterable<TestDataFailure> {
  const testData = TestData<T>().safeParse(data)
  if (testData.success) return yield* testData.data.failure
  for (const key in data)
    yield* getFailure((data as TestDataNamespace<Record<string, T>>)[key])
}

function validateData(validator: any, data: unknown, props: TestFixtureProps) {
  const testDataFn = TestDataFn().safeParse(data)
  if (testDataFn.success) {
    const validatorArgs = testDataFn.data[TestDataCall].map((arg) =>
      props.createValidator(arg)
    )
    props.validate(validator(...validatorArgs), testDataFn.data.data)
  } else {
    props.validate(validator, data)
  }
}
