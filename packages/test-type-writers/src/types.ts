import { GeneratorOptions, TypeWriters } from '@runtyping/generator'
import * as z from 'zod'

export interface TypeWriterTestProps<Validator = any> {
  createNumberValidator(): Validator
  createObjectValidator(shape: Record<string, Validator>): Validator
  createStringValidator(): Validator
  generatorOpts?: Partial<GeneratorOptions>
  ignore?: string[]
  typeWriters: TypeWriters
  validate(validator: Validator, data: unknown): void
}

export type TestDataNamespace<T extends Record<string, unknown>> = {
  [K in keyof T]: TestData<T[K]>
}

export function TestData<T>() {
  return z.strictObject({
    success: z.array(TestDataSuccess<T>()),
    failure: z.array(TestDataFailure()),
  })
}

export type TestData<T> = z.infer<ReturnType<typeof TestData<T>>>

export function TestDataSuccess<T>() {
  return z.union([TestDataFn<T>(), z.any() as z.ZodType<T>])
}

export type TestDataSuccess<T> = z.infer<ReturnType<typeof TestDataSuccess<T>>>

export function TestDataFailure() {
  return z.union([TestDataFn<any>(), z.any()])
}

export type TestDataFailure = z.infer<ReturnType<typeof TestDataFailure>>

export const TestDataCall = '$TestDataCall'

export const TestDataArgNumber = 'Number'

export const TestDataArgString = 'String'

export const TestDataArg: z.ZodType<TestDataArg> = z.lazy(() =>
  z.union([
    z.record(TestDataArg),
    z.literal(TestDataArgNumber),
    z.literal(TestDataArgString),
  ])
)

export type TestDataArg =
  | { [key: string]: TestDataArg }
  | typeof TestDataArgNumber
  | typeof TestDataArgString

export function TestDataFn<T>() {
  return z.strictObject({
    [TestDataCall]: z.array(TestDataArg),
    data: z.any() as z.ZodType<T>,
  })
}

export type TestDataFn<T> = z.infer<ReturnType<typeof TestDataFn<T>>>
