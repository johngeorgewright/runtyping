import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import { Import, TypeWriter, Write } from '@runtyping/generator/dist/TypeWriter'

export default function* arrayTypeWriter(type: Type): TypeWriter {
  yield [Import, 'Array']
  yield [Write, 'Array(']
  yield* generateOrReuseType(type.getArrayElementTypeOrThrow())
  yield [Write, ')']
}
