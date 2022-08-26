import * as t from 'io-ts'
import { separate } from '@johngw/array'
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
import { titleCase } from 'title-case'
import { Symbol as CompilerSymbol, SymbolFlags, Type } from 'ts-morph'
import { getEnumMembers } from '@runtyping/generator/dist/enum'
import ts, { EnumType } from '@ts-morph/common/lib/typescript'

export default class IoTsTypeWriters extends TypeWriters {
  #module = 'io-ts';

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'TypeOf' }]
    yield [Static, [type, 'TypeOf<typeof ${name}>']]
  }

  protected override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: this.#module, name: 'recursion' }]
    yield [Import, { source: this.#module, name: 'Type' }]
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `Type<${alias}>`]
    yield [Write, `recursion('${getTypeName(type)}', () => `]
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  protected override null() {
    return this.#simple('null')
  }

  protected override string() {
    return this.#simple('string')
  }

  protected override number() {
    return this.#simple('number')
  }

  protected override boolean() {
    return this.#simple('boolean')
  }

  protected override array(_type: Type, elementType: Type): TypeWriter {
    return this.#array(this.generateOrReuseType(elementType))
  }

  *#array(typeWriter: TypeWriter): TypeWriter {
    yield [Import, { source: this.#module, name: 'array' }]
    yield [Write, 'array(']
    yield* typeWriter
    yield [Write, ')']
  }

  protected override *tuple(type: Type): TypeWriter {
    const length = type.getTupleElements().length
    if (length === 0) {
      yield [Import, { source: '@runtyping/io-ts', name: 'validators' }]
      yield [Write, 'validators.emptyTuple']
    } else {
      yield [Import, { source: this.#module, name: 'tuple' }]
      yield [Import, { source: '@runtyping/io-ts', name: 'validators' }]
      const tupleStructure = `[${new Array(length).fill('unknown')}]`
      yield [
        Write,
        // Tuples are broken in io-ts, so we need to manually check the length
        // https://github.com/gcanti/io-ts/issues/503
        `validators.arrayOfLength<${tupleStructure}>(${length}).pipe(tuple([`,
      ]
      for (const element of type.getTupleElements()) {
        yield* this.generateOrReuseType(element)
        yield [Write, ', ']
      }
      yield [Write, ']))']
    }
  }

  override *variadicTuple(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'failure' }]
    yield [Import, { source: this.#module, name: 'success' }]
    yield [Import, { source: this.#module, name: 'Type' }]

    const staticType = yield* this.getStaticReference(type)

    yield* this.#array(this.#simple('unknown'))

    yield [
      Write,
      `.pipe(new Type<${staticType}, ${staticType}, unknown[]>(
      '${staticType}',
      (u): u is ${staticType} =>
        Array.isArray(u) && `,
    ]

    yield* this.#variadicTupleElements('u', type)

    yield [
      Write,
      `,
      (i, c) =>
        `,
    ]

    yield* this.#variadicTupleElements('i', type)

    yield [
      Write,
      `
          ? success(i as ${staticType})
          : failure(i, c, 'Variadic tuple does not match schema'),
      (a) => a
    ))`,
    ]
  }

  *#variadicTupleElements(dataName: string, type: Type): TypeWriter {
    yield [Write, `${dataName}.length >= ${Tuple.getTupleMinSize(type)}`]
    yield* this.variadicTupleElements({
      tupleType: type,
      *element(type, index) {
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `.is(${
            index >= 0
              ? `${dataName}[${index}]`
              : `${dataName}[${dataName}.length${index}]`
          })`,
        ]
      },
      *variadicElement(this: IoTsTypeWriters, type, from, to) {
        yield* this.#array(this.generateOrReuseType(type))
        yield [Write, `.is(${dataName}.slice(${from}, ${to}))`]
      },
      *separator() {
        yield [
          Write,
          `
            && `,
        ]
      },
    })
  }

  protected override *enum(type: Type<EnumType>): TypeWriter {
    const name = getTypeName(type)
    const members = getEnumMembers(type)
    const alias = `_${name}`
    yield [Import, { source: this.#module, name: 'union' }]
    yield [ImportFromSource, { alias, name }]
    yield [Write, 'union([']
    for (const member of members) {
      yield* this.#literal(`${alias}.${getTypeName(member)}`)
      yield [Write, ', ']
    }
    yield [Write, '])']
  }

  protected override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    const alias = `_${enumTypeName}`
    yield [ImportFromSource, { name: enumTypeName, alias }]
    yield* this.#literal(`${alias}.${getTypeName(type)}`)
  }

  protected override *intersection(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'intersection' }]
    const items = type.getIntersectionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this.undefined()
    yield [Write, 'intersection([']
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ', ']
    }
    yield [Write, '])']
  }

  protected override *union(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'union' }]
    const items = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!items.length) return yield* this.#simple('undefined')
    yield [Write, 'union([']
    for (const item of items) {
      yield* this.generateOrReuseType(item)
      yield [Write, ', ']
    }
    yield [Write, '])']
  }

  protected override literal(type: Type) {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield [Import, { source: this.#module, name: 'literal' }]
    yield [Write, `literal(${value})`]
  }

  protected override any() {
    return this.unknown()
  }

  protected override unknown() {
    return this.#simple('unknown')
  }

  protected override undefined() {
    return this.#simple('undefined')
  }

  protected override void() {
    return this.#simple('void')
  }

  protected override function() {
    return this.#simple('Function')
  }

  protected override *builtInObject(type: Type): TypeWriter {
    const T = type.getText()
    yield [Import, { source: this.#module, name: 'Type' }]
    yield [Import, { source: this.#module, name: 'failure' }]
    yield [Import, { source: this.#module, name: 'success' }]
    yield [
      Write,
      `new Type<${T}>(
        '${T}',
        (u): u is ${T} => u instanceof ${T},
        (i, c) => i instanceof ${T} ? success(i) : failure(i, c, 'not a ${T}'),
        (a) => a
      )`,
    ]
  }

  protected override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'string' }]
    yield [Import, { source: this.#module, name: 'record' }]
    yield [Write, 'record(string, ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')']
  }

  protected override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'number' }]
    yield [Import, { source: this.#module, name: 'record' }]
    yield [Write, 'record(number, ']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ')']
  }

  protected override *object(type: Type): TypeWriter {
    const [requiredProps, optionalProps] = separate(
      type.getProperties(),
      (item): item is CompilerSymbol => item.hasFlags(SymbolFlags.Optional)
    )

    if (optionalProps.length && requiredProps.length)
      yield* this.#writeRequiredAndOptionalObjectProperties(
        type,
        requiredProps,
        optionalProps
      )
    else if (requiredProps.length)
      yield* this.#writeRequiredObjectProperties(type, requiredProps)
    else if (optionalProps.length)
      yield* this.#writerOptionalObjectProperties(type, optionalProps)
  }

  *#writeRequiredObjectProperties(
    type: Type,
    properties: CompilerSymbol[]
  ): TypeWriter {
    yield [Import, { source: this.#module, name: 'type' }]
    yield [Write, 'type({']
    yield* this.objectProperties(type, { properties })
    yield [Write, '})']
  }

  *#writerOptionalObjectProperties(
    type: Type,
    properties: CompilerSymbol[]
  ): TypeWriter {
    yield [Import, { source: this.#module, name: 'partial' }]
    yield [Write, 'partial({']
    yield* this.objectProperties(type, { properties })
    yield [Write, '})']
  }

  *#writeRequiredAndOptionalObjectProperties(
    type: Type,
    requiredProperties: CompilerSymbol[],
    optionalProperties: CompilerSymbol[]
  ): TypeWriter {
    yield [Import, { source: this.#module, name: 'intersection' }]
    yield [Write, 'intersection([']
    yield* this.#writeRequiredObjectProperties(type, requiredProperties)
    yield [Write, ', ']
    yield* this.#writerOptionalObjectProperties(type, optionalProperties)
    yield [Write, '])']
  }

  protected override *genericObject(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: this.#module, name: 'TypeOf' }]
    yield [Import, { source: this.#module, name: 'Type' }]
    yield* this.objectFunction(type, 'Type', 'TypeOf')
  }

  *#simple(type: SimpleIOTSType): TypeWriter {
    if (primitiveNames.includes(type)) {
      const alias = titleCase(type)
      yield [Import, { source: this.#module, name: type, alias }]
      yield [Write, alias]
    } else {
      yield [Import, { source: this.#module, name: type }]
      yield [Write, type]
    }
  }
}

/**
 * An io-type is considered "simple" when it is already an io-ts type
 * and not a function that returns an io-ts.
 *
 * For example, `number` & `string` are simple types, but
 * `array` and `object` are not.
 */
type SimpleIOTSType = keyof PickByValue<typeof t, t.Type<any>>
const primitiveNames = ['any', 'never', 'null', 'undefined', 'unknown', 'void']
