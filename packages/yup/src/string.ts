import { mixed } from 'yup'

export function string() {
  return mixed<string>({
    type: 'string',
  })
    .defined()
    .test(
      'string',
      'Does not match a string type',
      (input) => typeof input === 'string',
    )
}
