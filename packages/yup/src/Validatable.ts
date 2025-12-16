import type { Lazy, Schema } from 'yup'

export type Validatable<T> = Schema<T> | Lazy<T>

export type ValidatableT<T extends Validatable<any>> =
  T extends Validatable<infer V> ? V : never
