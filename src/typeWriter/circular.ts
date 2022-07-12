import { Type } from 'ts-morph'
import lazyTypeWriter from './lazy'
import { DeclareType, Import, ImportFromSource } from './symbols'
import TypeWriter from './TypeWriter'

export default function* cicularTypeWriter(
  type: Type,
  name?: string
): TypeWriter {
  name = name || type.getSymbolOrThrow().getName()
  const alias = `_${name}`
  yield [Import, 'Runtype']
  yield [ImportFromSource, { alias, name }]
  yield [DeclareType, `Runtype<${alias}>`]
  yield* lazyTypeWriter(type, name)
}
