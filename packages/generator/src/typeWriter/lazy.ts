import { Type } from 'ts-morph'
import factory from './factory'
import { DeclareType, Import, ImportFromSource, Write } from './symbols'
import TypeWriter from './TypeWriter'

export default function* lazyTypeWriter(type: Type, name?: string): TypeWriter {
  name = name || type.getSymbolOrThrow().getName()
  const alias = `_${name}`
  yield [Import, 'Lazy']
  yield [Import, 'Runtype']
  yield [ImportFromSource, { alias, name }]
  yield [DeclareType, `Runtype<${alias}>`]
  yield [Write, 'Lazy(() => ']
  yield* factory(type, name)
  yield [Write, ')']
}
