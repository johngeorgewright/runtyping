import {
  infer as Infer,
  object,
  array,
  record,
  string,
  unknown as Unknown,
  undefined as Undefined,
} from 'zod'

export const ExampleSchema = object({
  testArray: array(record(string(), Unknown()))
    .min(2)
    .or(Undefined())
    .optional(),
})

export type ExampleSchema = Infer<typeof ExampleSchema>
