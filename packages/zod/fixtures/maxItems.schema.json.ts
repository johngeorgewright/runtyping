import {
  infer as Infer,
  object,
  tuple,
  record,
  string,
  unknown as Unknown,
  undefined as Undefined,
} from 'zod'

export const ExampleSchema = object({
  testArray: tuple([])
    .or(tuple([record(string(), Unknown())]))
    .or(tuple([record(string(), Unknown()), record(string(), Unknown())]))
    .or(Undefined())
    .optional(),
})

export type ExampleSchema = Infer<typeof ExampleSchema>
