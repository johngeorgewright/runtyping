import type { L, U } from 'ts-toolbelt'
import {
  Defined,
  type InferType,
  mixed,
  type Schema,
  ValidationError,
} from 'yup'
import type { Validatable } from './Validatable'

export function union<Schemas extends readonly Validatable<any>[]>(
  schemas: Schemas,
): Union<Schemas> {
  const nullable = !!schemas.find((schema) => schema.type === 'null')
  const definable = !schemas.find((schema) => schema.type === 'undefined')

  let schema = mixed() as Union<Schemas>

  if (nullable) schema = schema.nullable() as Union<Schemas>
  if (definable) schema = schema.defined() as Union<Schemas>

  schema = schema.test(
    'union',
    'Value does not match any of the expected types',
    (input) => {
      const errors: ValidationError[] = []
      for (const schema of schemas) {
        try {
          schema.validateSync(input)
          return true
        } catch (error) {
          if (error instanceof ValidationError) errors.push(error)
          else throw error
        }
      }
      return new ValidationError(errors)
    },
  ) as Union<Schemas>

  return schema as Union<Schemas>
}

type Union<Schemas extends readonly Validatable<any>[]> = Schema<
  InferUnionOf<Schemas> extends null
    ? InferUnionOf<Schemas> extends undefined
      ? InferUnionOf<Schemas>
      : Defined<InferUnionOf<Schemas>>
    : Exclude<
        InferUnionOf<Schemas> extends undefined
          ? InferUnionOf<Schemas>
          : Defined<InferUnionOf<Schemas>>,
        null
      >
>

type InferUnionOf<Schemas extends readonly Validatable<any>[]> = $InferUnionOf<
  // ensure we ununionize each value of the array
  U.ListOf<ArrayItem<Schemas>>,
  never
>

type $InferUnionOf<Schemas extends readonly Validatable<any>[], Union> =
  L.Length<Schemas> extends 0
    ? Union
    : $InferUnionOf<L.Tail<Schemas>, Union | InferType<L.Head<Schemas>>>

type ArrayItem<T extends readonly unknown[]> = T extends (infer V)[] ? V : never
