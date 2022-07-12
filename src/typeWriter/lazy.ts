import { Type } from 'ts-morph'
import factory from './factory'
import { Import, Write } from './symbols'
import TypeWriter from './TypeWriter'

export default function* lazyTypeWriter(type: Type, name?: string): TypeWriter {
  yield [Import, 'Lazy']
  yield [Write, 'Lazy(() => ']
  yield* factory(type, name || type.getSymbol()?.getName())
  yield [Write, ')']
}
