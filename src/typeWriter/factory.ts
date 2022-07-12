import { Type } from 'ts-morph'
import arrayTypeWriter from './array'
import circularTypeWriter from './circular'
import enumTypeWriter from './enum'
import functionTypeWriter from './function'
import intersecionTypeWriter from './intersection'
import lazyTypeWriter from './lazy'
import literalTypeWriter from './literal'
import objectTypeWriter from './object'
import simpleTypeWriter from './simple'
import tupleTypeWriter from './tuple'
import unionTypeWriter from './union'

export default function factory(
  type: Type,
  name?: string,
  {
    recursive = false,
    circular = false,
  }: { recursive?: boolean; circular?: boolean } = {}
) {
  switch (true) {
    case circular:
      return circularTypeWriter(type, name)

    case recursive:
      return lazyTypeWriter(type, name)

    case type.isNull():
      return simpleTypeWriter('Null')

    case type.isString():
      return simpleTypeWriter('String')

    case type.isNumber():
      return simpleTypeWriter('Number')

    case type.isBoolean():
      return simpleTypeWriter('Boolean')

    case type.isArray():
      return arrayTypeWriter(type)

    case type.isTuple():
      return tupleTypeWriter(type)

    case type.isEnum():
      return enumTypeWriter(type)

    case type.isIntersection():
      return intersecionTypeWriter(type)

    case type.isUnion():
      return unionTypeWriter(type)

    case type.isLiteral():
      return literalTypeWriter(type)

    case type.isAny():
    case type.isUnknown():
      return simpleTypeWriter('Unknown')

    case type.isUndefined():
      return simpleTypeWriter('Undefined')

    case type.getText() === 'void':
      return simpleTypeWriter('Void')

    case type.getCallSignatures().length > 0:
      return functionTypeWriter(type, name)

    case type.isInterface():
    case type.isObject():
      return objectTypeWriter(type)

    default:
      throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
  }
}
