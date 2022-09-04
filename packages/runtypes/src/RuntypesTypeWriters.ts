import {
  DeclareType,
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  PickByValue,
  sortUndefinedFirst,
  Static,
  Tuple,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import type * as runtypes from 'runtypes'
import { ts, Type } from 'ts-morph'

export default class RuntypesTypeWriters extends TypeWriters {
  #module = 'runtypes';

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Static' }]
    yield [Static, [type, 'Static<typeof ${name}>']]
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: this.#module, name: 'Lazy' }]
    yield [Import, { source: this.#module, name: 'Runtype' }]
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `Runtype<${alias}>`]
    yield [Write, 'Lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override null() {
    return this.#simple('Null')
  }

  override string() {
    return this.#simple('String')
  }

  override number() {
    return this.#simple('Number')
  }

  override boolean() {
    return this.#simple('Boolean')
  }

  override array(_type: Type, elementType: Type): TypeWriter {
    return this.#array(this.generateOrReuseType(elementType))
  }

  *#array(element: TypeWriter): TypeWriter {
    yield [Import, { source: this.#module, name: 'Array' }]
    yield [Write, 'Array(']
    yield* element
    yield [Write, ')']
  }

  override *tuple(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Tuple' }]
    yield [Write, 'Tuple(']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, ')']
  }

  override *variadicTuple(type: Type): TypeWriter {
    const staticType = yield* this.getStaticReference(type)
    yield* this.#array(this.#simple('Unknown'))
    yield [
      Write,
      `.withConstraint<${staticType}>(data =>
        data.length >= ${Tuple.getTupleMinSize(type)}`,
    ]

    yield* this.variadicTupleElements({
      tupleType: type,
      *element(type, index) {
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `.guard(${
            index >= 0 ? `data[${index}]` : `data[data.length${index}]`
          })`,
        ]
      },
      *variadicElement(this: RuntypesTypeWriters, type, from, to) {
        yield* this.#array(this.generateOrReuseType(type))
        yield [Write, `.guard(data.slice(${from}, ${to}))`]
      },
      *separator() {
        yield [Write, ' && ']
      },
    })

    yield [
      Write,
      `
      )`,
    ]
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, { source: this.#module, name: 'Guard' }]
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [
      Write,
      `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
    ]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield* this.#literal(`_${enumTypeName}.${getTypeName(type)}`)
  }

  override *intersection(type: Type): TypeWriter {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)
    if (!first) return yield* this.#simple('Undefined')
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.And(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override *union(type: Type): TypeWriter {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!first) return yield* this.#simple('Undefined')
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.Or(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override literal(type: Type) {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield [Import, { source: this.#module, name: 'Literal' }]
    yield [Write, `Literal(${value})`]
  }

  override any() {
    return this.unknown()
  }

  override unknown() {
    return this.#simple('Unknown')
  }

  override undefined() {
    return this.#simple('Undefined')
  }

  override void() {
    return this.#simple('Void')
  }

  override never() {
    return this.#simple('Never')
  }

  override function() {
    return this.#simple('Function')
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'InstanceOf' }]
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  override *object(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Record' }]
    yield [Write, 'Record({']
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield* propertyWriter
        yield [Write, '.optional()']
      },
    })
    yield [Write, '})']
  }

  protected override *withGenerics(
    type: Type<ts.ObjectType>
  ): TypeWriter<() => TypeWriter> {
    yield [Import, { source: this.#module, name: 'Static' }]
    yield [Import, { source: this.#module, name: 'Runtype' }]
    return yield* this.openGenericFunction(type, 'Runtype', 'Static')
  }

  override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Dictionary' }]
    yield [Write, 'Dictionary(']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ', ']
    yield* this.string()
    yield [Write, ')']
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Dictionary' }]
    yield [Write, 'Dictionary(']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ', ']
    yield* this.number()
    yield [Write, ')']
  }

  *#simple(type: SimpleRuntype): TypeWriter {
    yield [Import, { source: this.#module, name: type }]
    yield [Write, type]
  }
}

/**
 * A runtype is considered "simple" when it is already a Runtype
 * and not a function that returns a Runtype.
 *
 * For example, `Number` & `String` are simple types, but
 * `Array` and `Record` are not.
 */
type SimpleRuntype = keyof PickByValue<typeof runtypes, runtypes.Runtype>
