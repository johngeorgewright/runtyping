import { type InferType, object, type Schema, ValidationError } from 'yup'
import type { Validatable } from './Validatable'

export function record<K extends Validatable<any>, V extends Validatable<any>>(
  keySchema: K,
  valueSchema: V,
) {
  return object()
    .defined()
    .test('record', 'Object doesnt match the key and value schema', (input) => {
      const errors: ValidationError[] = []
      for (const [key, value] of Object.entries(input)) {
        try {
          keySchema.validateSync(key)
        } catch (error) {
          if (error instanceof ValidationError) errors.push(error)
          else throw error
        }
        try {
          valueSchema.validateSync(value)
        } catch (error) {
          if (error instanceof ValidationError) errors.push(error)
          else throw error
        }
      }
      return errors.length ? new ValidationError(errors) : true
    }) as unknown as Schema<Record<InferType<K>, InferType<V>>>
}
