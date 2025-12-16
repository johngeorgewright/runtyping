import { mixed } from 'yup'

export function _null() {
  return mixed({
    type: 'null',
  })
    .defined()
    .nullable()
    .test('null', 'Does not match a null type', (input) => input === null)
}
