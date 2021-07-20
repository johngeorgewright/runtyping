import { Type } from 'ts-morph'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, ImportFromSource, Write } from './symbols'

export default function* enumTypeGenerator(type: Type): RuntypeGenerator {
  const name = type.getSymbolOrThrow().getName()
  yield [Import, 'Guard']
  yield [ImportFromSource, name]
  yield [
    Write,
    `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
  ]
}
