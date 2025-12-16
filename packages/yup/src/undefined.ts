import { mixed } from 'yup'

export function _undefined() {
  return mixed<never>({
    type: 'undefined',
  }).test(
    'null',
    'Does not match an undefined type',
    (input) => input === undefined,
  )
}
