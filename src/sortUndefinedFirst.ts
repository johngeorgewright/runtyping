import { Type } from 'ts-morph'

export default function sortUndefinedFirst(a: Type, b: Type) {
  return (
    Number(a.isUndefined()) - Number(b.isUndefined()) || +(a > b) || -(a < b)
  )
}
