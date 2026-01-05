import { Schema } from 'joi'

export type Infer<TSchema extends Schema> =
  TSchema extends Schema<infer Value> ? Value : never
