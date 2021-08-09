import { Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* tupleTypeGenerator(type: Type): RuntypeGenerator {
  yield [Import, 'Tuple']
  yield [Write, 'Tuple(']
  for (const element of type.getTupleElements()) {
    yield* generateOrReuseType(element)
    yield [Write, ',']
  }
  yield [Write, ')']
}
