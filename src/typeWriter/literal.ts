import { Type } from 'ts-morph'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* literalTypeGenerator(type: Type): RuntypeGenerator {
  yield [Import, 'Literal']
  yield [Write, `Literal(${type.getText()})`]
}
