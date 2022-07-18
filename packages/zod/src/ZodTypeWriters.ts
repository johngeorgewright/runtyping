import {
  DeclareType,
  escapeQuottedPropName,
  getGenerics,
  getTypeName,
  Import,
  ImportFromSource,
  propNameRequiresQuotes,
  sortUndefinedFirst,
  Static,
  StaticParameters,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { titleCase } from 'title-case'
import { SymbolFlags, SyntaxKind, Type } from 'ts-morph'
import * as zod from 'zod'

export default class ZodTypeWriterFactory extends TypeWriters {
  override *defaultStaticImplementation(): TypeWriter {
    yield [Import, { alias: 'Infer', name: 'infer' }]
    yield [Static, 'Infer<typeof ${name}>']
  }

  override any() {
    return this.#simple('any')
  }

  override *array(type: Type): TypeWriter {
    yield [Import, 'array']
    yield [Write, 'array(']
    yield* this.generateOrReuseType(type.getArrayElementTypeOrThrow())
    yield [Write, ')']
  }

  override boolean() {
    return this.#simple('boolean')
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [Import, { name: 'instanceof', alias: 'InstanceOf' }]
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, 'nativeEnum']
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [Write, `nativeEnum(_${name})`]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = getTypeName(
      type
        .getSymbolOrThrow()
        .getValueDeclarationOrThrow()
        .getFirstAncestorByKindOrThrow(SyntaxKind.EnumDeclaration)
        .getType()
    )

    yield [Import, 'literal']
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield [Write, `literal(_${enumTypeName}.${getTypeName(type)})`]
  }

  override *function(): TypeWriter {
    yield [Import, { alias: 'func', name: 'function' }]
    yield [Write, 'func()']
  }

  override *intersection(type: Type): TypeWriter {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)

    if (!first) return yield* this.#simple('undefined')

    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.and(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, 'lazy']
    yield [Import, 'ZodType']
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `ZodType<${alias}>`]
    yield [Write, 'lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override *literal(type: Type): TypeWriter {
    yield [Import, 'literal']
    yield [Write, `literal(${type.getText()})`]
  }

  override null() {
    return this.#simple('null')
  }

  override number() {
    return this.#simple('number')
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, 'record']
    yield [Import, 'number']
    yield [Write, 'record(number(), ']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ')']
  }

  override *object(type: Type): TypeWriter {
    yield [Import, 'object']
    yield [Write, 'object({']

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

    yield [Import, { alias: 'Infer', name: 'infer' }]
    yield [Import, 'ZodType']
    yield [Write, '<']

    for (const generic of generics) {
      const constraint = generic.getConstraint()
      const constraintDeclaredType = constraint?.getSymbol()?.getDeclaredType()

      yield [Write, `${generic.getText()} extends `]

      if (constraintDeclaredType) {
        yield [Write, 'Infer<typeof ']
        yield* this.generateOrReuseType(constraintDeclaredType)
        yield [Write, '>']
      } else yield [Write, constraint ? constraint.getText() : 'any']

      yield [Write, ', ']
    }

    yield [Write, '>(']

    for (const generic of generics)
      yield [Write, `${generic.getText()}: ZodType<${generic.getText()}>, `]

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
      `Infer<ReturnType<typeof ${getTypeName(type)}<${generics.map((generic) =>
        generic.getText()
      )}>>>`,
    ]
  }

  override string() {
    return this.#simple('string')
  }

  override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, 'record']
    yield [Import, 'string']
    yield [Write, 'record(string(), ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')']
  }

  override *tuple(type: Type): TypeWriter {
    yield [Import, 'tuple']
    yield [Write, 'tuple(']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, ')']
  }

  override undefined() {
    return this.#simple('undefined')
  }

  override *union(type: Type): TypeWriter {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

    if (!first) return yield* this.#simple('undefined')

    yield* this.generateOrReuseType(first)

    for (const item of rest) {
      yield [Write, '.or(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override unknown() {
    return this.#simple('unknown')
  }

  override void() {
    return this.#simple('void')
  }

  *#simple(type: keyof typeof zod): TypeWriter {
    if (primitiveNames.includes(type)) {
      const alias = titleCase(type)
      yield [Import, { name: type, alias }]
      yield [Write, `${alias}()`]
    } else {
      yield [Import, type]
      yield [Write, `${type}()`]
    }
  }
}

const primitiveNames = ['any', 'never', 'null', 'undefined', 'unknown', 'void']
