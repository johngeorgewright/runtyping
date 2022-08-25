import {
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  sortUndefinedFirst,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import Joi from 'joi'
import { separate } from '@johngw/array'
import { ts, Type } from 'ts-morph'

export default class JoiTypeWriters extends TypeWriters {
  #module = 'joi';

  override *defaultStaticImplementation(): TypeWriter {
    // yield* this.any()
  }

  override any() {
    return this.#use('any')
  }

  override *array(type: Type): TypeWriter {
    yield* this.#array(
      this.generateOrReuseType(type.getArrayElementTypeOrThrow())
    )
  }

  *#array(element: TypeWriter): TypeWriter {
    yield* this.#use('array')
    yield [Write, '.items(']
    yield* element
  }

  override *boolean(): TypeWriter {
    yield* this.#literal('true, false')
  }

  override *builtInObject(_type: Type): TypeWriter {
    yield* this.any()
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [ImportFromSource, { name, alias }]
    yield* this.#use('alternatives')
    yield [Write, `.try(...Object.values(${alias}))`]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield* this.#literal(`_${enumTypeName}.${getTypeName(type)}`)
  }

  override *function(): TypeWriter {
    yield* this.#use('function')
  }

  override *intersection(type: Type): TypeWriter {
    const items = type.getIntersectionTypes()
    if (!items.length) return yield* this.undefined()
    const [nonObjects, [firstObject, ...objects]] = separate(
      items,
      (item): item is Type<ts.ObjectType> => item.isObject()
    )
    yield* this.#use('alternatives')
    yield [Write, ".match('all').try("]
    if (firstObject) yield* this.generateOrReuseType(firstObject)
    for (const object of objects) {
      yield [Write, '.append(']
      yield* this.#objectProperties(object)
      yield [Write, '), ']
    }
    for (const item of nonObjects) {
      yield* this.generateOrReuseType(item)
      yield [Write, ', ']
    }
    yield [Write, ')']
  }

  override *lazy(_type: Type): TypeWriter {
    yield* this.any()
  }

  override literal(type: Type): TypeWriter {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield* this.#use()
    yield [Write, `valid(${value}).required()`]
  }

  override *null(): TypeWriter {
    yield* this.#use()
    yield [Write, 'valid(null).required()']
  }

  override *number(): TypeWriter {
    yield* this.#use('number')
    yield [Write, '.required()']
  }

  override *numberIndexedObject(_type: Type): TypeWriter {
    yield* this.any()
  }

  override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield* this.#use()
    yield [Write, 'object(']
    yield* this.#objectProperties(type)
    yield [Write, ').required()']
  }

  *#objectProperties(type: Type<ts.ObjectType>): TypeWriter {
    yield [Write, '{']
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield* propertyWriter
        yield [Write, '.optional()']
      },
    })
    yield [Write, '}']
  }

  override *genericObject(_type: Type<ts.ObjectType>): TypeWriter {
    yield* this.any()
  }

  override *string(): TypeWriter {
    yield* this.#use('string')
    yield [Write, '.required()']
  }

  override *stringIndexedObject(_type: Type): TypeWriter {
    yield* this.any()
  }

  override *tuple(type: Type): TypeWriter {
    const elements = type.getTupleElements()
    yield* this.#use('array')
    if (!elements.length) return yield [Write, '.max(0)']
    yield [Write, '.ordered(']
    for (const element of elements) {
      yield* this.generateOrReuseType(element)
      yield [Write, '.required()']
      yield [Write, ',']
    }
    yield [Write, ').required()']
  }

  override *undefined(): TypeWriter {
    yield* this.#literal('null')
  }

  override *union(type: Type): TypeWriter {
    const items = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this.undefined()
    yield* this.#use('alternatives')
    yield [Write, '.try(']
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ', ']
    }
    yield [Write, ').required()']
  }

  override unknown() {
    return this.any()
  }

  override *variadicTuple(type: Type): TypeWriter {
    yield* this.#use('array')
    yield [Write, '.ordered(']

    let postVariadic = false

    yield* this.variadicTupleElements({
      tupleType: type,
      element: function* (type) {
        if (postVariadic) {
          yield [Write, '.ordered(']
          postVariadic = false
        }
        yield* this.generateOrReuseType(type)
      },
      variadicElement: function* (this: JoiTypeWriters, type) {
        postVariadic = true
        yield [Write, ').items(']
        yield* this.generateOrReuseType(type)
        yield [Write, ')']
      },
    })

    yield [Write, ')']
  }

  override void() {
    return this.undefined()
  }

  *#import(): TypeWriter {
    yield [Import, { source: this.#module, default: 'Joi' }]
  }

  *#use(type?: keyof typeof Joi): TypeWriter {
    yield* this.#import()
    yield [Write, 'Joi.']
    if (type) yield [Write, `${type}()`]
  }
}
