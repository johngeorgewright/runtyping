import { TypeWriters } from '@runtyping/generator'

export interface TypeWriterTestProps<Validator = any> {
  typeWriters: TypeWriters
  validate(validator: Validator, data: unknown): void
}

export interface TestData<T> {
  success: T[]
  failure: any[]
}
