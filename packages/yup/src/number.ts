import { mixed } from 'yup'

export function number() {
  return mixed<number>({
    type: 'number',
  })
    .defined()
    .test(
      'number',
      'Does not match a number type',
      (input) => typeof input === 'number',
    )
}
