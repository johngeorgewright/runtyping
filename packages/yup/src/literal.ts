import { Defined, mixed, Schema } from 'yup'

export function literal<T extends string | number | boolean>(
  value: T,
): Schema<Defined<T>> {
  return mixed().oneOf([value]).defined() as Schema<Defined<T>>
}
