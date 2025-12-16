import {
  CanDeclareStatics,
  DeclareType,
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  sortUndefinedFirst,
  Static,
  Tuple,
  TypeWriter,
  TypeWriters as $TypeWriters,
  Write,
} from '@runtyping/generator'
import { ts, Type } from 'ts-morph'

export default class TypeWriters extends $TypeWriters {
  #parserModule = 'yup'
  #thisModule = '@runtyping/yup'

  override attachTransformer(
    typeWriter: TypeWriter,
    _fileName: string,
    _exportName: string,
  ): TypeWriter {
    return typeWriter
    // const alias = `${exportName}Transformer`
    // yield [Import, { source: fileName, name: exportName, alias }]
    // yield* typeWriter
    // yield [Write, `.transform(${alias})`]
  }

  protected override *any(): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [Write, 'mixed().nullable()']
  }

  protected override *array(_type: Type, elementType: Type): TypeWriter {
    yield* this.#array(this.generateOrReuseType(elementType))
  }

  *#array(element: TypeWriter): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'array' }]
    yield [Write, 'array().of(']
    yield* element
    yield [Write, ').defined()']
  }

  protected override *boolean(): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'boolean' }]
    yield [Write, 'boolean()']
  }

  protected override *builtInObject(type: Type): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [
      Write,
      `mixed((input): input is ${type.getText()} => input instanceof ${type.getText()}).defined()`,
    ]
  }

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [
      Import,
      { source: this.#parserModule, name: 'InferType', isTypeOnly: true },
    ]
    yield [Static, [type, 'InferType<typeof ${name}>']]
  }

  protected override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [Write, `mixed().oneOf(Object.values(_${name})).defined()`]
  }

  protected override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield [
      Write,
      `mixed().oneOf([_${enumTypeName}.${getTypeName(type)}]).defined()`,
    ]
  }

  protected override *function(): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [
      Write,
      'mixed((input): input is Function => typeof input === "function").defined()',
    ]
  }

  protected override *intersection(type: Type): TypeWriter {
    const elements = type.getIntersectionTypes().sort(sortUndefinedFirst)
    if (!elements.length) return yield* this.undefined()
    yield* this.generateOrReuseType(elements[0])
    for (const element of elements.slice(1)) {
      yield [Write, '.concat(']
      yield* this.generateOrReuseType(element)
      yield [Write, ')']
    }
    yield [Write, '.defined()']
  }

  protected override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: this.#parserModule, name: 'lazy' }]
    yield [
      Import,
      { source: this.#parserModule, name: 'Lazy', isTypeOnly: true },
    ]
    yield [ImportFromSource, { alias, name, isTypeOnly: true }]
    yield [DeclareType, `Lazy<${alias}>`]
    yield [Write, 'lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, '.default(undefined))']
  }

  protected override literal(type: Type): TypeWriter {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'literal' }]
    yield [Write, `literal(${value})`]
  }

  protected override *never(): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'never', alias: 'Never' }]
    yield [Write, 'Never()']
  }

  protected override *null(): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'null', alias: 'Null' }]
    yield [Write, 'Null()']
  }

  protected override *number(): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'number' }]
    yield [Write, 'number()']
  }

  protected override numberIndexedObject(type: Type): TypeWriter {
    return this.#record(this.number(), type)
  }

  protected override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'object' }]
    yield [Write, 'object({']
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield* propertyWriter
        yield [Write, '.optional()']
      },
    })
    yield [Write, '}).defined()']
  }

  *#record(key: TypeWriter, type: Type): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'record' }]
    yield [Write, 'record(']
    yield* key
    yield [Write, ', ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')']
  }

  protected override *string(): TypeWriter {
    yield [Import, { source: this.#thisModule, name: 'string' }]
    yield [Write, 'string()']
  }

  protected override stringIndexedObject(type: Type): TypeWriter {
    return this.#record(this.string(), type)
  }

  protected override *tuple(type: Type): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'tuple' }]
    yield [Write, 'tuple([']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, ']).defined()']
  }

  protected override *undefined(): TypeWriter {
    yield [
      Import,
      { source: this.#thisModule, name: 'undefined', alias: 'Undefined' },
    ]
    yield [Write, 'Undefined()']
  }

  protected override *union(type: Type): TypeWriter {
    const items = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this.undefined()
    yield [Import, { source: this.#thisModule, name: 'union' }]
    yield [Write, `union([`]
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ',']
    }
    yield [Write, '])']
  }

  protected override *unknown(): TypeWriter {
    yield [Import, { source: this.#parserModule, name: 'mixed' }]
    yield [Write, 'mixed().nullable()']
  }

  protected override *variadicTuple(type: Type): TypeWriter {
    if (yield [CanDeclareStatics, type])
      yield [Static, [type, yield* this.getStaticReference(type)]]

    yield* this.#array(this.any())
    yield [Write, `.min(${Tuple.getTupleMinSize(type)})`]
    yield [
      Write,
      `.test('variadic-tuple', "The tuple matches it's variadic length", (data) => `,
    ]

    yield* this.variadicTupleElements({
      tupleType: type,
      *element(type, index) {
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `.isValidSync(${index >= 0 ? `data![${index}]` : `data![data.length${index}]`})`,
        ]
      },
      *variadicElement(this: TypeWriters, type, from, to) {
        yield* this.#array(this.generateOrReuseType(type))
        yield [Write, `.isValidSync(data!.slice(${from}, ${to}))`]
      },
      *separator() {
        yield [Write, ' && ']
      },
    })

    yield [
      Write,
      `
      ).defined()`,
    ]
  }

  protected override *void(): TypeWriter {
    yield* this.undefined()
  }

  protected override *withGenerics(
    typeWriter: TypeWriter,
    type: Type<ts.Type>,
  ): TypeWriter {
    yield [
      Import,
      { source: this.#parserModule, name: 'InferType', isTypeOnly: true },
    ]
    yield [
      Import,
      { source: this.#parserModule, name: 'Schema', isTypeOnly: true },
    ]
    const close = yield* this.openGenericFunction(type, 'Schema', 'InferType')
    yield* typeWriter
    yield* close()
  }
}
