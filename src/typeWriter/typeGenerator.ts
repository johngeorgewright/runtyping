import { Type } from 'ts-morph'
import arrayTypeGenerator from './array'
import enumTypeGenerator from './enum'
import intersecionTypeGenerator from './intersection'
import literalTypeGenerator from './literal'
import objectTypeGenerator from './object'
import RuntypeGenerator from './RuntypeGenerator'
import simpleTypeGenerator from './simple'
import { Import, Write } from './symbols'
import unionTypeGenerator from './union'

export default function* typeGenerator(
  type: Type,
  isRecursive = false
): RuntypeGenerator {
  if (isRecursive) {
    yield [Import, 'Lazy']
    yield [Write, 'Lazy(() => ']
  }

  switch (true) {
    case type.isString():
      yield* simpleTypeGenerator('String')
      break

    case type.isNumber():
      yield* simpleTypeGenerator('Number')
      break

    case type.isBoolean():
      yield* simpleTypeGenerator('Boolean')
      break

    case type.isArray():
      yield* arrayTypeGenerator(type)
      break

    case type.isEnum():
      yield* enumTypeGenerator(type)
      break

    case type.isIntersection():
      yield* intersecionTypeGenerator(type)
      break

    case type.isUnion():
      yield* unionTypeGenerator(type)
      break

    case type.isLiteral():
      yield* literalTypeGenerator(type)
      break

    case type.isAny():
      yield* simpleTypeGenerator('Unknown')
      break

    case type.isUndefined():
      yield* simpleTypeGenerator('Undefined')
      break

    case type.isInterface():
    case type.isObject():
      yield* objectTypeGenerator(type)
      break

    default:
      throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
  }

  if (isRecursive) {
    yield [Write, ')']
  }
}
