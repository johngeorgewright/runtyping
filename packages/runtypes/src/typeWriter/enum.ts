import { Type } from 'ts-morph'
import {
  Import,
  ImportFromSource,
  TypeWriter,
  Write,
} from '@runtyping/generator/dist/TypeWriter'

export default function* enumTypeWriter(type: Type): TypeWriter {
  const name = type.getSymbolOrThrow().getName()
  yield [Import, 'Guard']
  yield [ImportFromSource, { name, alias: `_${name}` }]
  yield [
    Write,
    `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
  ]
}
