import { Type } from 'ts-morph'
import factory from './factory'
import { Import, ImportFromSource, Write } from './symbols'
import TypeWriter from './TypeWriter'

export default function* lazyTypeWriter(type: Type): TypeWriter {
  const name = type.getSymbolOrThrow().getName()
  yield [Import, 'Lazy']
  yield [Import, 'Runtype']
  yield [ImportFromSource, { alias: `_${name}`, name }]
  yield [Write, 'Lazy(() => ']
  yield* factory(type, name)
  yield [Write, ')']
}
