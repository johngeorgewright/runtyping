import { mixed } from 'yup'

export function boolean() {
  return mixed<boolean>({ type: 'boolean' })
    .defined()
    .test(
      'boolean',
      'Does not match a boolean type',
      (input) => typeof input === 'boolean',
    )
}
