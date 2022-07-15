import { Type } from 'ts-morph'
import { Import, TypeWriter, Write } from '@runtyping/generator/dist/TypeWriter'

export default function* literalTypeWriter(type: Type): TypeWriter {
  yield [Import, 'Literal']
  yield [Write, `Literal(${type.getText()})`]
}
