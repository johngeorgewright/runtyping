import assertNever from 'assert-never'
import { mkdirp } from 'mkdirp'
import * as pathHelper from 'path'
import { Project, SourceFile } from 'ts-morph'
import { Generator } from '@runtyping/generator'
import ts from 'typescript'
import {
  TestData,
  TestDataArg,
  TestDataArgNumber,
  TestDataArgString,
  TestDataCall,
  TestDataFailure,
  TestDataFn,
  TestDataNamespace,
  TestDataSuccess,
  TypeWriterTestProps,
} from './types'
import { ExpectedFailure, ExpectedSuccess } from './error'
import { writeFile } from 'fs/promises'
import { zodGuard } from './zod'
import { mapValues } from './util'

export const fixturesDir = pathHelper.resolve(__dirname, '..', 'fixtures')

export const fixturesSourceDir = pathHelper.join(fixturesDir, 'source')

export const fixturesDataDir = pathHelper.join(fixturesDir, 'data')

export const fixturesDestDir = `${process.cwd()}/fixtures`

interface TestFixtureProps extends TypeWriterTestProps {
  exportStaticType?: boolean
  project?: Project
}

export async function testFixture(testName: string, props: TestFixtureProps) {
  await mkdirp(fixturesDestDir)
  const dataNames = (await getDataNames(testName)).filter(
    (dataName) => !props.ignore?.includes(`${testName}.${dataName}`),
  )
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
        : name,
    )
  }
  try {
    return $getDataNames(
      await import(pathHelper.join(fixturesDataDir, `${testName}.ts`)),
    )
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function generate(
  testName: string,
  dataNames: string[],
  { exportStaticType, generatorOpts, project, typeWriters }: TestFixtureProps,
) {
  const generator = new Generator({
    typeWriters,
    targetFile: pathHelper.join(fixturesDestDir, `${testName}.ts`),
    project,
    transformers: {
      TransformStringToNumber: {
        file: '@runtyping/test-type-writers/transformers/stringToNumber',
        export: 'stringToNumber',
      },
    },
    ...generatorOpts,
  })

  const sourceFile = await generator.generate([
    {
      exportStaticType,
      file: pathHelper.join(
        fixturesSourceDir,
        pathHelper.extname(testName) === '.json' ? testName : `${testName}.ts`,
      ),
      type: dataNames,
    },
  ])

  try {
    ts.transpile(sourceFile.getText())
  } catch (error) {
    console.error(error)
    throw error
  }

  return sourceFile
}

async function validate(
  testName: string,
  dataNames: string[],
  sourceFile: SourceFile,
  props: TestFixtureProps,
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
  data: TestData<T> | TestDataNamespace<Record<string, T>>,
): Iterable<TestDataSuccess<T>> {
  if (zodGuard(TestData<T>())(data)) return yield* data.success
  for (const key in data)
    yield* getSuccess((data as TestDataNamespace<Record<string, T>>)[key])
}

function* getFailure<T>(
  data: TestData<T> | TestDataNamespace<Record<string, T>>,
): Iterable<TestDataFailure> {
  if (zodGuard(TestData<T>())(data)) return yield* data.failure
  for (const key in data)
    yield* getFailure((data as TestDataNamespace<Record<string, T>>)[key])
}

function validateData(validator: any, data: unknown, props: TestFixtureProps) {
  if (isTestDataFn(data)) {
    props.validate(validator(...createValidatorArgs(props, data)), data.data)
  } else props.validate(validator, data)
}

function createValidatorArgs<T>(props: TestFixtureProps, data: TestDataFn<T>) {
  return data[TestDataCall].map((arg) => createValidatorArg(props, arg))
}

function createValidatorArg(props: TestFixtureProps, data: TestDataArg): any {
  return data === TestDataArgNumber
    ? props.createNumberValidator()
    : data === TestDataArgString
      ? props.createStringValidator()
      : typeof data === 'object'
        ? props.createObjectValidator(
            mapValues(data, (arg) => createValidatorArg(props, arg)),
          )
        : assertNever(data)
}

const isTestDataFn = zodGuard(TestDataFn())
