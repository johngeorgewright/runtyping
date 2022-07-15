import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter from './TypeWriter'
import { Import, Write } from './symbols'

export default function* arrayTypeWriter(type: Type): TypeWriter {
  yield [Import, 'Array']
  yield [Write, 'Array(']
  yield* generateOrReuseType(type.getArrayElementTypeOrThrow())
  yield [Write, ')']
}
