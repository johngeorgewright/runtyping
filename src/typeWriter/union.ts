import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter from './TypeWriter'
import simpleTypeGenerator from './simple'
import sortUndefinedFirst from '../sortUndefinedFirst'
import { Write } from './symbols'

export default function* unionTypeGenerator(type: Type): TypeWriter {
  const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

  if (!first) return yield* simpleTypeGenerator('Undefined')

  yield* generateOrReuseType(first)
  for (const item of rest) {
    yield [Write, '.Or(']
    yield* generateOrReuseType(item)
    yield [Write, ')']
  }
}
