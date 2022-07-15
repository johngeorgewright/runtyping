import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import { TypeWriter, Write } from '@runtyping/generator/dist/TypeWriter'
import simpleTypeWriter from './simple'
import sortUndefinedFirst from '@runtyping/generator/dist/sortUndefinedFirst'

export default function* unionTypeWriter(type: Type): TypeWriter {
  const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

  if (!first) return yield* simpleTypeWriter('Undefined')

  yield* generateOrReuseType(first)

  for (const item of rest) {
    yield [Write, '.Or(']
    yield* generateOrReuseType(item)
    yield [Write, ')']
  }
}