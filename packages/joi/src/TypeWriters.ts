import {
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  sortUndefinedFirst,
  Static,
  Tuple,
  type TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { ts, Type } from 'ts-morph'

export default class JoiTypeWriters extends TypeWriters {
  #parserModule = 'joi'
  #thisModule = '@runtyping/joi'
  #links = new Set<string>();

  *#import(): TypeWriter {
    yield [
      Import,
      { source: this.#parserModule, name: 'default', alias: 'Joi' },
    ]
  }

  override onOpenFile(): void {
    this.#links.clear()
  }

  protected override *any(): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.any()']
  }

  protected override *array(_type: Type, elementType: Type): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.array().items(']
    yield* this.generateOrReuseType(elementType)
    yield [Write, ').required()']
  }

  override attachTransformer(
    typeWriter: TypeWriter,
    _fileName: string,
    _exportName: string,
  ): TypeWriter {
    return typeWriter
  }

  protected override *boolean(): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.boolean().strict().required()']
  }

  protected override *builtInObject(type: Type): TypeWriter {
    yield* this.#import()
    yield [Write, `Joi.object().instance(${type.getText()}).required()`]
  }

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [
      Import,
      { source: this.#thisModule, name: 'Infer', isTypeOnly: true },
    ]
    yield [Static, [type, 'Infer<typeof ${name}>']]
  }

  protected override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [ImportFromSource, { name, alias }]
    yield* this.any()
    yield [Write, `.valid(...Object.values(${alias})).required()`]
  }

  protected override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    const alias = `_${enumTypeName}`
    yield* this.any()
    yield [ImportFromSource, { name: enumTypeName, alias }]
    yield [Write, `.valid(${alias}.${getTypeName(type)}).required()`]
  }

  protected override *function(): TypeWriter {
    yield* this.#import()
    yield [Write, `Joi.func().required()`]
  }

  protected override *intersection(type: Type): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.append(']
    yield* this.generateOrReuseType(type)
    yield [Write, ')']
  }

  protected override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    this.#links.add(name)
    yield* this.typeWriter(type)
    yield [Write, `.id('${name}')`]
  }

  protected override *literal(type: Type): TypeWriter {
    yield* this.any()
    yield [Write, `.valid(${type.getText()})`]
  }

  protected override *never(): TypeWriter {
    yield* this.any()
    yield [Write, ".custom((_value, helpers) => helpers.error('Never'))"]
  }

  protected override *null(): TypeWriter {
    yield* this.any()
    yield [Write, '.valid(null).required()']
  }

  protected override *number(): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.number().strict().required()']
  }

  protected override *numberIndexedObject(type: Type): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.object().pattern(']
    yield* this.number()
    yield [Write, ',']
    yield* this.generateOrReuseType(type)
    yield [Write, ')']
  }

  protected override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.object({']
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield* propertyWriter
        yield [Write, '.optional()']
      },
    })
    yield [Write, '})']
  }

  override *redeclare(name: string): TypeWriter {
    if (this.#links.has(name)) {
      yield* this.#import()
      yield [Write, "Joi.link('#"]
      yield* super.redeclare(name)
      yield [Write, "')"]
    } else {
      yield* super.redeclare(name)
    }
  }

  protected override *withGenerics(
    typeWriter: TypeWriter,
    type: Type<ts.Type>,
  ): TypeWriter {
    yield [
      Import,
      { source: this.#parserModule, name: 'AnySchema', isTypeOnly: true },
    ]
    yield [
      Import,
      { source: this.#thisModule, name: 'Infer', isTypeOnly: true },
    ]
    const close = yield* this.openGenericFunction(type, 'AnySchema', 'Infer')
    yield* typeWriter
    yield* close()
  }

  protected override *string(): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.string().required()']
  }

  protected override *stringIndexedObject(type: Type): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.object().pattern(']
    yield* this.string()
    yield [Write, ',']
    yield* this.generateOrReuseType(type)
    yield [Write, ').required()']
  }

  protected override *tuple(type: Type): TypeWriter {
    const elements = type.getTupleElements()
    yield* this.#import()
    yield [Write, `Joi.array().length(${elements.length})`]
    if (elements.length) {
      yield [Write, '.ordered(']
      for (const element of elements) {
        yield* this.generateOrReuseType(element)
        yield [Write, ', ']
      }
      yield [Write, ')']
    }
    yield [Write, '.required()']
  }

  protected override *undefined(): TypeWriter {
    yield* this.any()
    yield [Write, '.forbidden()']
  }

  protected override *union(type: Type): TypeWriter {
    yield* this.#import()
    yield [Write, `Joi.alternatives().try(`]
    const items = type.getUnionTypes().sort(sortUndefinedFirst)
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ',']
    }
    yield [Write, ').required()']
  }

  protected override unknown(): TypeWriter {
    return this.any()
  }

  protected override *variadicTuple(type: Type): TypeWriter {
    yield* this.#import()
    yield [
      Write,
      `Joi.array().min(${Tuple.getTupleMinSize(type)}).custom((data) => [
      `,
    ]

    yield* this.variadicTupleElements({
      tupleType: type,
      *element(this: JoiTypeWriters, type, index) {
        yield [Import, { source: this.#parserModule, name: 'attempt' }]
        yield [Write, `attempt(data.at(${index}), `]
        yield* this.generateOrReuseType(type)
        yield [Write, ')']
      },
      *variadicElement(this: JoiTypeWriters, type, from, to) {
        yield [Import, { source: this.#parserModule, name: 'attempt' }]
        yield [
          Write,
          `...attempt(data.slice(${from}, ${to}), Joi.array().items(`,
        ]
        yield* this.generateOrReuseType(type)
        yield [Write, '.optional()))']
      },
      *separator() {
        yield [Write, ',\n']
      },
    })

    yield [Write, `\n]).required()`]
  }

  protected override void(): TypeWriter {
    return this.undefined()
  }
}
