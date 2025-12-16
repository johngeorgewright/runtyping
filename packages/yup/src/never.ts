import { mixed, ValidationError } from 'yup'

export function _never() {
  return mixed<never>().test(
    'never',
    'Will always throw',
    () => new ValidationError('Should never be a value'),
  )
}
