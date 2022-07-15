import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import { Import, TypeWriter, Write } from '@runtyping/generator/dist/TypeWriter'

export default function* tupleTypeWriter(type: Type): TypeWriter {
  yield [Import, 'Tuple']
  yield [Write, 'Tuple(']
  for (const element of type.getTupleElements()) {
    yield* generateOrReuseType(element)
    yield [Write, ',']
  }
  yield [Write, ')']
}
