import {
  CanDeclareStatics,
  DeclareType,
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  sortUndefinedFirst,
  Static,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { titleCase } from 'title-case'
import { ts, Type } from 'ts-morph'
import type * as zod from 'zod'

export abstract class ZodCoreTypeWriters extends TypeWriters {
  protected abstract parserModule: string
  protected abstract thisModule: string
  protected coreModule = 'zod/v4/core';

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [
      Import,
      { source: this.parserModule, name: 'output', isTypeOnly: true },
    ]
    yield [Static, [type, 'output<typeof ${name}>']]
  }

  override any() {
    return this._simple('any')
  }

  override array(_type: Type, elementType: Type): TypeWriter {
    return this._array(this.generateOrReuseType(elementType))
  }

  protected *_array(element: TypeWriter): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'array' }]
    yield [Write, 'array(']
    yield* element
    yield [Write, ')']
  }

  override boolean() {
    return this._simple('boolean')
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [
      Import,
      { source: this.parserModule, name: 'instanceof', alias: 'InstanceOf' },
    ]
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, { source: this.parserModule, name: 'enum', alias: 'Enum' }]
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [Write, `Enum(_${name})`]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield* this.#literal(`_${enumTypeName}.${getTypeName(type)}`)
  }

  override *function(_type: Type): TypeWriter {
    yield [
      Import,
      { source: this.parserModule, name: 'instanceof', alias: 'InstanceOf' },
    ]
    yield [Write, `InstanceOf(Function)`]
  }

  override *intersection(type: Type): TypeWriter {
    const items = type.getIntersectionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this._simple('undefined')
    yield [Import, { source: this.parserModule, name: 'intersection' }]
    yield [Write, 'intersection(']
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ',']
    }
    yield [Write, ')']
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: this.parserModule, name: 'lazy' }]
    yield [
      Import,
      { source: this.coreModule, name: '$ZodType', isTypeOnly: true },
    ]
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `$ZodType<${alias}>`]
    yield [Write, 'lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override literal(type: Type): TypeWriter {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'literal' }]
    yield [Write, `literal(${value})`]
  }

  override never() {
    return this._simple('never')
  }

  override null() {
    return this._simple('null')
  }

  override number() {
    return this._simple('number')
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'record' }]
    yield [Import, { source: this.parserModule, name: 'number' }]
    yield [Write, 'record(number(), ']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ')']
  }

  override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'object' }]
    yield [Write, 'object({']
    yield* this.objectProperties(type, {
      *whenOptional(this: ZodCoreTypeWriters, propertyWriter) {
        yield [Import, { source: this.parserModule, name: 'optional' }]
        yield [Write, 'optional(']
        yield* propertyWriter
        yield [Write, ')']
      },
    })
    yield [Write, '})']
  }

  override string() {
    return this._simple('string')
  }

  override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'record' }]
    yield [Import, { source: this.parserModule, name: 'string' }]
    yield [Write, 'record(string(), ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')']
  }

  override *tuple(type: Type): TypeWriter {
    yield [Import, { source: this.parserModule, name: 'tuple' }]
    yield [Write, 'tuple([']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, '])']
  }

  override undefined() {
    return this._simple('undefined')
  }

  override *union(type: Type): TypeWriter {
    const items = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this._simple('undefined')
    yield [Import, { source: this.parserModule, name: 'union' }]
    yield [Write, 'union([']
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ',']
    }
    yield [Write, '])']
  }

  override unknown() {
    return this._simple('unknown')
  }

  protected abstract openVariadicTuple(type: Type): TypeWriter
  protected abstract closeVariadicTuple(): TypeWriter

  override *variadicTuple(type: Type): TypeWriter {
    if (yield [CanDeclareStatics, type])
      yield [Static, [type, yield* this.getStaticReference(type)]]

    yield* this.openVariadicTuple(type)

    yield* this.variadicTupleElements({
      tupleType: type,
      *element(this: ZodCoreTypeWriters, type, index) {
        yield [Import, { source: this.thisModule, name: 'pipeIssues' }]
        yield [Import, { source: this.parserModule, name: 'safeParse' }]
        yield [
          Write,
          `pipeIssues(safeParse, {
            ctx,
            data: ${
              index >= 0 ? `data[${index}]` : `data[data.length${index}]`
            },
            path: ${index >= 0 ? index : `data.length${index}`},
            type: `,
        ]
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `
          });`,
        ]
      },
      *variadicElement(this: ZodCoreTypeWriters, type, from, to) {
        yield [Import, { source: this.thisModule, name: 'pipeIssues' }]
        yield [Import, { source: this.parserModule, name: 'safeParse' }]
        yield [
          Write,
          `pipeIssues(safeParse, {
            ctx,
            data: data.slice(${from}, ${to}),
            path: \`${from}-\${${from} + data.slice(${from}, ${to}).length}\`,
            type: `,
        ]
        yield* this._array(this.generateOrReuseType(type))
        yield [Write, '});']
      },
      *separator() {
        yield [Write, '\n']
      },
    })

    yield* this.closeVariadicTuple()
  }

  override void() {
    return this._simple('void')
  }

  override *withGenerics(
    typeWriter: TypeWriter,
    type: Type<ts.Type>,
  ): TypeWriter {
    yield [
      Import,
      { source: this.parserModule, name: 'output', isTypeOnly: true },
    ]
    yield [
      Import,
      { source: this.coreModule, name: '$ZodType', isTypeOnly: true },
    ]
    const close = yield* this.openGenericFunction(type, '$ZodType', 'output')
    yield* typeWriter
    yield* close()
  }

  protected *_simple(type: keyof typeof zod): TypeWriter {
    if (primitiveNames.includes(type)) {
      const alias = titleCase(type)
      yield [Import, { source: this.parserModule, name: type, alias }]
      yield [Write, `${alias}()`]
    } else {
      yield [Import, { source: this.parserModule, name: type }]
      yield [Write, `${type}()`]
    }
  }
}

const primitiveNames: (keyof typeof zod)[] = [
  'any',
  'never',
  'null',
  'undefined',
  'unknown',
  'void',
]
