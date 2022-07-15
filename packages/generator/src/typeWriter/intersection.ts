import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter from './TypeWriter'
import simpleTypeWriter from './simple'
import sortUndefinedFirst from '../sortUndefinedFirst'
import { Write } from './symbols'

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
