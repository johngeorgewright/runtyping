import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import simpleTypeWriter from './simple'
import sortUndefinedFirst from '@runtyping/generator/dist/sortUndefinedFirst'
import { TypeWriter, Write } from '@runtyping/generator/dist/TypeWriter'

export default function* intersecionTypeWriter(type: Type): TypeWriter {
  const [first, ...rest] = type.getIntersectionTypes().sort(sortUndefinedFirst)

  if (!first) return yield* simpleTypeWriter('Undefined')

  yield* generateOrReuseType(first)
  for (const item of rest) {
    yield [Write, '.And(']
    yield* generateOrReuseType(item)
    yield [Write, ')']
  }
}
