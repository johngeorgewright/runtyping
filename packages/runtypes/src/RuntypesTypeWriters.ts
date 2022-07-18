import {
  getGenerics,
  getTypeName,
  StaticParameters,
} from '@runtyping/generator'
import {
  DeclareType,
  escapeQuottedPropName,
  Import,
  ImportFromSource,
  PickByValue,
  propNameRequiresQuotes,
  sortUndefinedFirst,
  Static,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import type * as runtypes from 'runtypes'
import { SymbolFlags, SyntaxKind, Type } from 'ts-morph'

export default class RuntypesTypeWriters extends TypeWriters {
  override *defaultStaticImplementation(): TypeWriter {
    yield [Import, 'Static']
    yield [Static, 'Static<typeof ${name}>']
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, 'Lazy']
    yield [Import, 'Runtype']
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `Runtype<${alias}>`]
    yield [Write, 'Lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override null() {
    return this.#simpleTypeWriter('Null')
  }

  override string() {
    return this.#simpleTypeWriter('String')
  }

  override number() {
    return this.#simpleTypeWriter('Number')
  }

  override boolean() {
    return this.#simpleTypeWriter('Boolean')
  }

  override *array(type: Type): TypeWriter {
    yield [Import, 'Array']
    yield [Write, 'Array(']
    yield* this.generateOrReuseType(type.getArrayElementTypeOrThrow())
    yield [Write, ')']
  }

  override *tuple(type: Type): TypeWriter {
    yield [Import, 'Tuple']
    yield [Write, 'Tuple(']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, ')']
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, 'Guard']
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [
      Write,
      `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
    ]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = getTypeName(
      type
        .getSymbolOrThrow()
        .getValueDeclarationOrThrow()
        .getFirstAncestorByKindOrThrow(SyntaxKind.EnumDeclaration)
        .getType()
    )

    yield [Import, 'Literal']
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield [Write, `Literal(_${enumTypeName}.${getTypeName(type)})`]
  }

  override *intersection(type: Type): TypeWriter {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)
    if (!first) return yield* this.#simpleTypeWriter('Undefined')
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.And(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override *union(type: Type): TypeWriter {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)
    if (!first) return yield* this.#simpleTypeWriter('Undefined')
    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.Or(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override *literal(type: Type): TypeWriter {
    yield [Import, 'Literal']
    yield [Write, `Literal(${type.getText()})`]
  }

  override any() {
    return this.#simpleTypeWriter('Unknown')
  }

  override unknown() {
    return this.#simpleTypeWriter('Unknown')
  }

  override undefined() {
    return this.#simpleTypeWriter('Undefined')
  }

  override void() {
    return this.#simpleTypeWriter('Void')
  }

  override function() {
    return this.#simpleTypeWriter('Function')
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [Import, 'InstanceOf']
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  override *object(type: Type): TypeWriter {
    yield [Import, 'Record']
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

    yield [Import, 'Static']
    yield [Import, 'Runtype']
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
    yield [Import, 'Dictionary']
    yield [Import, 'String']
    yield [Write, 'Dictionary(']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ', String)']
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, 'Dictionary']
    yield [Import, 'Number']
    yield [Write, 'Dictionary(']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ', Number)']
  }

  *#simpleTypeWriter(type: SimpleRuntype): TypeWriter {
    yield [Import, type]
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
