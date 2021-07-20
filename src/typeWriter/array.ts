import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* arrayTypeGenerator(type: Type): RuntypeGenerator {
  yield [Import, 'Array']
  yield [Write, 'Array(']
  yield* generateOrReuseType(type.getArrayElementTypeOrThrow())
  yield [Write, ')']
}
