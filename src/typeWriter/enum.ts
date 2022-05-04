import { Type } from 'ts-morph'
import TypeWriter from './TypeWriter'
import { Import, ImportFromSource, Write } from './symbols'

export default function* enumTypeWriter(type: Type): TypeWriter {
  const name = type.getSymbolOrThrow().getName()
  yield [Import, 'Guard']
  yield [ImportFromSource, { name, alias: `_${name}` }]
  yield [
    Write,
    `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
  ]
}
