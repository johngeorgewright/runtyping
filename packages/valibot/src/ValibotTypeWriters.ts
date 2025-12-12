import {
  DeclareType,
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  Static,
  sortUndefinedFirst,
  Tuple,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { Type, ts } from 'ts-morph'

export default class ValibotTypeWriters extends TypeWriters {
  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'InferOutput', isTypeOnly: true }]
    yield [Static, [type, 'InferOutput<typeof ${name}>']]
  }

  *#simple(
    name: string,
    {
      alias,
      type,
      typeWriter,
    }: { alias?: string; type?: Type; typeWriter?: TypeWriter } = {},
  ): TypeWriter {
    const importOptions = alias ? { alias } : {}
    yield [Import, { source: 'valibot', name, ...importOptions }]
    yield [Write, `${alias ?? name}(`]
    if (type) yield* this.generateOrReuseType(type)
    if (typeWriter) yield* typeWriter
    yield [Write, ')']
  }

  override null(): TypeWriter {
    return this.#simple('null', { alias: 'Null' })
  }

  override string(): TypeWriter {
    return this.#simple('string')
  }

  override number(): TypeWriter {
    return this.#simple('number')
  }

  override boolean(): TypeWriter {
    return this.#simple('boolean')
  }

  override undefined() {
    return this.#simple('undefined', { alias: 'Undefined' })
  }

  override unknown() {
    return this.#simple('unknown')
  }

  override void() {
    return this.#simple('void')
  }

  override never() {
    return this.#simple('never')
  }

  override any() {
    return this.#simple('any')
  }

  override array(_type: Type, elementType: Type): TypeWriter {
    return this.#simple('array', { type: elementType })
  }

  *#tuple(types: Type[]): TypeWriter {
    yield [Import, { source: 'valibot', name: 'strictTuple' }]
    yield [Write, 'strictTuple([']
    for (const element of types) {
      yield* this.generateOrReuseType(element)
      yield [Write, ', ']
    }
    yield [Write, '])']
  }

  override tuple(type: Type): TypeWriter {
    return this.#tuple(type.getTypeArguments())
  }

  override *variadicTuple(type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'array' }]
    yield [Import, { source: 'valibot', name: 'check' }]
    yield [Import, { source: 'valibot', name: 'minLength' }]
    yield [Import, { source: 'valibot', name: 'pipe' }]
    yield [Write, 'pipe(']
    yield* this.#simple('array', { typeWriter: this.unknown() })
    yield [Write, ', ']
    yield [Write, `minLength(${Tuple.getTupleMinSize(type)}), `]
    yield [Write, `check(data => `]
    yield* this.variadicTupleElements({
      tupleType: type,
      *element(type, index) {
        yield [Import, { source: 'valibot', name: 'is' }]
        yield [Write, 'is(']
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `, ${index >= 0 ? `data[${index}]` : `data[data.length${index}]`}`,
        ]
        yield [Write, ')']
      },
      *variadicElement(this: ValibotTypeWriters, type, from, to) {
        yield [Import, { source: 'valibot', name: 'is' }]
        yield [Import, { source: 'valibot', name: 'length' }]
        yield [Write, 'is(']
        yield [Write, 'pipe(']
        yield* this.#simple('array', { type })
        yield [Write, `, length(data.slice(${from}, ${to}).length)`]
        yield [Write, ')']
        yield [Write, `, data.slice(${from}, ${to})`]
        yield [Write, ')']
      },
      *separator() {
        yield [Write, ' && ']
      },
    })
    yield [Write, ')']
    yield [Write, ')']
  }

  override *union(type: Type): TypeWriter {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

    if (!first) return yield* this.undefined()
    if (!rest.length) return yield* this.generateOrReuseType(first)

    yield [Import, { source: 'valibot', name: 'union' }]

    yield [Write, 'union([']
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, ', ']
      yield* this.generateOrReuseType(item)
    }
    yield [Write, '])']
  }

  override *withGenerics(typeWriter: TypeWriter, type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'InferOutput', isTypeOnly: true }]
    yield [
      Import,
      { source: 'valibot', name: 'GenericSchema', isTypeOnly: true },
    ]
    const closeFunction = yield* this.openGenericFunction(
      type,
      'GenericSchema',
      'InferOutput',
    )
    yield* typeWriter
    yield* closeFunction()
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: 'valibot', name: 'enum', alias: 'Enum' }]
    yield [ImportFromSource, { name, alias }]
    yield [Write, `Enum(${alias})`]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield* this.#literal(`_${enumTypeName}.${getTypeName(type)}`)
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'instance' }]
    yield [Write, `instance(${type.getText()})`]
  }

  override *function(_type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'function', alias: 'func' }]
    yield [Write, 'func()']
  }

  override *intersection(type: Type): TypeWriter {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)

    if (!first) return yield* this.undefined()
    if (!rest.length) return yield* this.generateOrReuseType(type)

    yield [Import, { source: 'valibot', name: 'intersect' }]

    yield [Write, 'intersect([']
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, ', ']
      yield* this.generateOrReuseType(item)
    }
    yield [Write, '])']
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: 'valibot', name: 'lazy' }]
    yield [
      Import,
      { source: 'valibot', name: 'GenericSchema', isTypeOnly: true },
    ]
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `GenericSchema<${alias}>`]
    yield [Write, 'lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override literal(type: Type): TypeWriter {
    return this.#literal(type.getText())
  }

  *#literal(literal: string): TypeWriter {
    yield [Import, { source: 'valibot', name: 'literal' }]
    yield [Write, `literal(${literal})`]
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'record' }]
    yield [Import, { source: 'valibot', name: 'number' }]
    yield [Write, 'record(number(), ']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ')']
  }

  override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: 'valibot', name: 'object' }]
    yield [Write, 'object({']
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield [Import, { source: 'valibot', name: 'optional' }]
        yield [Write, 'optional(']
        yield* propertyWriter
        yield [Write, ')']
      },
    })
    yield [Write, '})']
  }

  override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: 'valibot', name: 'custom' }]
    yield [Import, { source: 'valibot', name: 'intersect' }]
    yield [Import, { source: 'valibot', name: 'record' }]
    yield [Import, { source: 'valibot', name: 'string' }]
    yield [Write, 'intersect([']
    yield [Write, 'record(string(), ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')'] // /record
    yield [
      Write,
      ', custom((data) => !Array.isArray(data), "Unexpected array")',
    ]
    yield [Write, '])'] // /intersect
  }

  override *attachTransformer(
    typeWriter: TypeWriter,
    fileName: string,
    exportName: string,
  ): TypeWriter {
    const alias = `${exportName}Transformer`
    yield [Import, { source: 'valibot', name: 'pipe' }]
    yield [Import, { source: 'valibot', name: 'transform' }]
    yield [Import, { source: fileName, name: exportName, alias }]
    yield [Write, 'pipe(']
    yield* typeWriter
    yield [Write, `, transform(${alias})`]
    yield [Write, `)`]
  }
}
