import { Import, Tuple, TypeWriter, Write } from '@runtyping/generator'
import { ZodCoreTypeWriters } from '@runtyping/zod-core'
import { Type } from 'ts-morph'

export default class ZodTypeWriters extends ZodCoreTypeWriters {
  protected parserModule = 'zod'
  protected thisModule = '@runtyping/zod';

  override *attachTransformer(
    typeWriter: TypeWriter,
    fileName: string,
    exportName: string,
  ): TypeWriter {
    const alias = `${exportName}Transformer`
    yield [Import, { source: fileName, name: exportName, alias }]
    yield* typeWriter
    yield [Write, `.transform(${alias})`]
  }

  protected override *openVariadicTuple(type: Type): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'array' }]
    yield* this._array(this._simple('any'))
    yield [Write, `.min(${Tuple.getTupleMinSize(type)})`]
    yield [Write, '.superRefine((data, ctx) => {']
  }

  protected override *closeVariadicTuple(): TypeWriter {
    yield [Write, '})']
  }
}
