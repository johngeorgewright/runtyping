import {
  DeclareType,
  Enum,
  escapeQuottedPropName,
  getGenerics,
  getTypeName,
  Import,
  ImportFromSource,
  PickByValue,
  propNameRequiresQuotes,
  sortUndefinedFirst,
  Static,
  StaticParameters,
  Tuple,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { getTupleMinSize } from '@runtyping/generator/dist/tuple'
import type * as runtypes from 'runtypes'
import { SymbolFlags, Type } from 'ts-morph'

export default class RuntypesTypeWriters extends TypeWriters {
  #module = 'runtypes';

  override *defaultStaticImplementation(): TypeWriter {
    yield [Import, { source: this.#module, name: 'Static' }]
    yield [Static, 'Static<typeof ${name}>']
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

  override *array(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'Array' }]
    yield [Write, 'Array(']
    yield* this.generateOrReuseType(type.getArrayElementTypeOrThrow())
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
    yield [Import, { source: this.#module, name: 'Array' }]
    yield [Write, 'Array(']
    const types = Tuple.getTupleElementTypes(type)
    if (types.length > 1) {
      yield [Import, { source: this.#module, name: 'Union' }]
      yield [Write, 'Union(']
      for (const type of types) {
        yield* this.generateOrReuseType(type)
        yield [Write, ', ']
      }
      yield [Write, ')']
    } else yield* this.generateOrReuseType(types[0])
    yield [Write, ')']
    const minTupleSize = getTupleMinSize(type)
    if (minTupleSize !== undefined)
      yield [Write, `.withConstraint(t => t.length >= ${minTupleSize})`]
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
    return this.#simple('Unknown')
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

    const typeArguments = getGenerics(type).map((typeArgument) =>
      typeArgument.getText()
    )

    for (const property of type.getProperties()) {
      yield [
        Write,
        `${
          propNameRequiresQuotes(property.getName())
            ? `[\`${escapeQuottedPropName(property.getName())}\`]`
            : property.getName()
        }:`,
      ]
      const propertyType = property.getValueDeclarationOrThrow().getType()
      if (!typeArguments.includes(propertyType.getText()))
        yield* this.generateOrReuseType(propertyType)
      else yield [Write, propertyType.getText()]
      if (property.hasFlags(SymbolFlags.Optional)) yield [Write, '.optional()']
      yield [Write, ',']
    }

    yield [Write, '})']
  }

  override *genericObject(type: Type): TypeWriter {
    const generics = getGenerics(type)

    yield [Import, { source: this.#module, name: 'Static' }]
    yield [Import, { source: this.#module, name: 'Runtype' }]
    yield [Write, '<']

    for (const generic of generics) {
      const constraint = generic.getConstraint()
      const constraintDeclaredType = constraint?.getSymbol()?.getDeclaredType()

      yield [Write, `${generic.getText()} extends `]

      if (constraintDeclaredType) {
        yield [Write, 'Static<typeof ']
        yield* this.generateOrReuseType(constraintDeclaredType)
        yield [Write, '>']
      } else yield [Write, constraint ? constraint.getText() : 'any']

      yield [Write, ', ']
    }

    yield [Write, '>(']

    for (const generic of generics)
      yield [Write, `${generic.getText()}: Runtype<${generic.getText()}>, `]

    yield [Write, ') => ']

    yield* this.object(type)

    yield [
      StaticParameters,
      generics.map((generic) => {
        const constraint = generic.getConstraint()
        const constraintDeclaredType = constraint
          ?.getSymbol()
          ?.getDeclaredType()
        return {
          name: generic.getText(),
          constraint: constraintDeclaredType
            ? getTypeName(constraintDeclaredType)
            : constraint?.getText(),
        }
      }),
    ]

    yield [
      Static,
      `Static<ReturnType<typeof ${getTypeName(type)}<${generics.map((generic) =>
        generic.getText()
      )}>>>`,
    ]
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
