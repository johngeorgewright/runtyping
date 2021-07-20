import { Type } from 'ts-morph'
import arrayTypeGenerator from './array'
import enumTypeGenerator from './enum'
import intersecionTypeGenerator from './intersection'
import literalTypeGenerator from './literal'
import objectTypeGenerator from './object'
import simpleTypeGenerator from './simple'
import unionTypeGenerator from './union'

export default function factory(type: Type) {
  switch (true) {
    case type.isString():
      return simpleTypeGenerator('String')

    case type.isNumber():
      return simpleTypeGenerator('Number')

    case type.isBoolean():
      return simpleTypeGenerator('Boolean')

    case type.isArray():
      return arrayTypeGenerator(type)

    case type.isEnum():
      return enumTypeGenerator(type)

    case type.isIntersection():
      return intersecionTypeGenerator(type)

    case type.isUnion():
      return unionTypeGenerator(type)

    case type.isLiteral():
      return literalTypeGenerator(type)

    case type.isAny():
      return simpleTypeGenerator('Unknown')

    case type.isUndefined():
      return simpleTypeGenerator('Undefined')

    case type.isInterface():
    case type.isObject():
      return objectTypeGenerator(type)

    default:
      throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
  }
}
