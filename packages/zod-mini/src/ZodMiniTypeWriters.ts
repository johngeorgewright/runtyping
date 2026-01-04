import { Import, Tuple, TypeWriter, Write } from '@runtyping/generator'
import { ZodCoreTypeWriters } from '@runtyping/zod-core'
import { Type } from 'ts-morph'

export default class ZodMiniTypeWriters extends ZodCoreTypeWriters {
  protected override parserModule = 'zod/mini'
  protected override thisModule = '@runtyping/zod-mini';

  override *attachTransformer(
    typeWriter: TypeWriter,
    fileName: string,
    exportName: string,
  ): TypeWriter {
    const alias = `${exportName}Transformer`
    yield [Import, { source: fileName, name: exportName, alias }]
    yield [Import, { source: this.parserModule, name: 'pipe' }]
    yield [Import, { source: this.parserModule, name: 'transform' }]
    yield [Write, 'pipe(']
    yield* typeWriter
    yield [Write, `, transform(${alias}))`]
  }

  protected override *openVariadicTuple(type: Type): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'array' }]
    yield [Import, { source: this.parserModule, name: 'minLength' }]
    yield [Import, { source: this.parserModule, name: 'superRefine' }]
    yield* this._array(this._simple('any'))
    yield [Write, `.check(`]
    yield [Write, `minLength(${Tuple.getTupleMinSize(type)})`]
    yield [Write, ', superRefine((data, ctx) => {']
  }

  protected override *closeVariadicTuple(): TypeWriter {
    yield [Write, '}))']
  }
}
