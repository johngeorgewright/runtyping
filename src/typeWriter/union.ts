import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import simpleTypeGenerator from './simple'
import sortUndefinedFirst from './sortUndefinedFirst'
import { Write } from './symbols'

export default function* unionTypeGenerator(type: Type): RuntypeGenerator {
  const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

  if (!first) {
    yield* simpleTypeGenerator('Undefined')
    return
  }

  yield* generateOrReuseType(first)
  for (const item of rest) {
    yield [Write, '.Or(']
    yield* generateOrReuseType(item)
    yield [Write, ')']
  }
}
