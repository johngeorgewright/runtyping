import { Symbol as CompilerSymbol, SymbolFlags, ts, Type } from 'ts-morph'
import { InstructionTypeTransformer, Tuple } from '.'
import { getArrayElementType, isArray } from './array'
import {
  escapeQuottedPropName,
  getGenerics,
  isBuiltInType,
  propNameRequiresQuotes,
} from './object'
import {
  DeclareAndUse,
  ImportFromSource,
  Static,
  StaticParameters,
  TypeWriter,
  Write,
} from './TypeWriter'
import { getTypeName } from './util'

export default abstract class TypeWriters {
  typeWriter(
    type: Type,
    {
      recursive = false,
      circular = false,
      transformer,
    }: {
      recursive?: boolean
      circular?: boolean
      transformer?: InstructionTypeTransformer
    } = {},
  ): TypeWriter {
    let typeWriter = ((): TypeWriter => {
      switch (true) {
        case circular:
        case recursive:
          return this.lazy(type)

        case type.isEnumLiteral():
          return this.enumLiteral(type)

        case type.isNever():
          return this.never(type)

        case type.isNull():
          return this.null(type)

        case type.isString():
          return this.string(type)

        case type.isNumber():
          return this.number(type)

        case type.isBoolean():
          return this.boolean(type)

        case isArray(type):
          return this.array(type, getArrayElementType(type))

        case type.isTuple():
          return Tuple.isVariadicTuple(type)
            ? this.variadicTuple(type)
            : this.tuple(type)

        case type.isEnum():
          return this.enum(type)

        case type.isIntersection():
          return this.intersection(type)

        case type.isUnion():
          return this.union(type)

        case type.isLiteral():
          return this.literal(type)

        case type.isAny():
          return this.any(type)

        case type.isUnknown():
          return this.unknown(type)

        case type.isUndefined():
          return this.undefined(type)

        case type.getText() === 'void':
          return this.void(type)

        case type.getCallSignatures().length > 0:
          return this.function(type)

        case type.isInterface():
        case type.isObject():
          switch (true) {
            case isBuiltInType(type):
              return this.builtInObject(type)

            case !!type.getStringIndexType():
              return this.stringIndexedObject(type)

            case !!type.getNumberIndexType():
              return this.numberIndexedObject(type)

            default:
              return this.object(type as Type<ts.ObjectType>)
          }

        default:
          return this.fallback(type)
      }
    })()

    if (transformer)
      typeWriter = this.attachTransformer(
        typeWriter,
        transformer.file,
        transformer.export,
      )

    if (this.#requiresGenericFunction(type))
      typeWriter = this.withGenerics(typeWriter, type)

    return typeWriter
  }

  *fallback(type: Type): TypeWriter {
    try {
      yield [Write, getTypeName(type)]
    } catch (error) {
      yield* this.unknown(type)
    }
  }

  abstract attachTransformer(
    typeWriter: TypeWriter,
    fileName: string,
    exportName: string,
  ): TypeWriter<void | (() => TypeWriter)>

  #requiresGenericFunction(type: Type) {
    try {
      getTypeName(type)
      return !!getGenerics(type).length && !type.isArray() && !type.isTuple()
    } catch (error) {
      return false
    }
  }

  *generateOrReuseType(type: Type): TypeWriter {
    const symbol = type.getAliasSymbol() || type.getSymbol()
    const typeName = symbol?.getName()

    if (
      !!typeName &&
      !type.isEnumLiteral() &&
      (yield [DeclareAndUse, typeName])
    ) {
      if (this.#requiresGenericFunction(type)) {
        yield [Write, '(']
        for (const arg of getGenerics(type)) {
          yield* this.generateOrReuseType(arg)
          yield [Write, ', ']
        }
        yield [Write, ')']
      }

      return
    }

    yield* this.typeWriter(type)
  }

  protected *getStaticReference(type: Type): TypeWriter<string> {
    try {
      const name = getTypeName(type)
      const alias = `_${name}`
      yield [ImportFromSource, { alias, name }]
      return alias
    } catch (error) {
      return type.getText()
    }
  }

  protected *objectPropertyKey(property: CompilerSymbol): TypeWriter {
    yield [
      Write,
      `${
        propNameRequiresQuotes(property.getName())
          ? `[\`${escapeQuottedPropName(property.getName())}\`]`
          : property.getName()
      }:`,
    ]
  }

  protected *objectProperties(
    type: Type,
    {
      properties = type.getProperties(),
      whenOptional = function* (propertyWriter) {
        yield* propertyWriter
      },
      whenRequired = function* (propertyWriter) {
        yield* propertyWriter
      },
    }: {
      whenOptional?(this: TypeWriters, propertyWriter: TypeWriter): TypeWriter
      whenRequired?(this: TypeWriters, propertyWriter: TypeWriter): TypeWriter
      properties?: CompilerSymbol[]
    },
  ): TypeWriter {
    const typeArguments = getGenerics(type).map((typeArgument) =>
      typeArgument.getText(),
    )
    const typeWriter = this

    for (const property of properties) {
      yield* this.objectPropertyKey(property)
      const propertyType = property.getValueDeclarationOrThrow().getType()
      yield* property.hasFlags(SymbolFlags.Optional)
        ? whenOptional.call(this, propertyWriter(propertyType))
        : whenRequired.call(this, propertyWriter(propertyType))
      yield [Write, ',']
    }

    function* propertyWriter(propertyType: Type): TypeWriter {
      if (!typeArguments.includes(propertyType.getText()))
        yield* typeWriter.generateOrReuseType(propertyType)
      else yield [Write, propertyType.getText()]
    }
  }

  protected *openGenericFunction(
    type: Type,
    baseType: string,
    staticHelper: string,
  ): TypeWriter<() => TypeWriter> {
    const generics = getGenerics(type)
    yield [Write, '<']

    for (const generic of generics) {
      const constraint = generic.getConstraint()
      const constraintDeclaredType = constraint?.getSymbol()?.getDeclaredType()

      yield [Write, `${generic.getText()} extends `]

      if (constraintDeclaredType) {
        yield [Write, `${staticHelper}<typeof `]
        yield* this.generateOrReuseType(constraintDeclaredType)
        yield [Write, '>']
      } else yield [Write, constraint ? constraint.getText() : 'any']

      yield [Write, ', ']
    }

    yield [Write, '>(']

    for (const generic of generics)
      yield [Write, `${generic.getText()}: ${baseType}<${generic.getText()}>, `]

    yield [Write, ') => ']

    return function* closeGenericFunction() {
      yield [
        StaticParameters,
        [
          type,
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
        ],
      ]

      yield [
        Static,
        [
          type,
          `${staticHelper}<ReturnType<typeof ${getTypeName(
            type,
          )}<${generics.map((generic) => generic.getText())}>>>`,
        ],
      ]
    }
  }

  protected *variadicTupleElements({
    tupleType,
    element,
    separator,
    variadicElement,
  }: {
    tupleType: Type
    element(this: TypeWriters, type: Type, index: number): TypeWriter
    variadicElement(
      this: TypeWriters,
      type: Type,
      from: number,
      to?: number,
    ): TypeWriter
    separator?(): TypeWriter
  }): TypeWriter {
    const types = Tuple.getTupleElements(tupleType)
    let variadicIndex
    for (let i = 0; i < types.length; i++) {
      if (separator && i > 0) yield* separator()
      const { element: elementType, variadic } = types[i]
      if (variadic) {
        variadicIndex = i
        yield* variadicElement.call(
          this,
          elementType,
          i,
          i === types.length - 1 ? undefined : i - (types.length - 1),
        )
      } else
        yield* element.call(
          this,
          elementType,
          variadicIndex === undefined ? i : i - types.length,
        )
    }
  }

  abstract defaultStaticImplementation(type: Type): TypeWriter
  protected abstract lazy(type: Type): TypeWriter
  protected abstract null(type: Type): TypeWriter
  protected abstract string(type: Type): TypeWriter
  protected abstract number(type: Type): TypeWriter
  protected abstract boolean(type: Type): TypeWriter
  protected abstract array(type: Type, elementType?: Type): TypeWriter
  protected abstract tuple(type: Type): TypeWriter
  protected abstract variadicTuple(type: Type): TypeWriter
  protected abstract enum(type: Type): TypeWriter
  protected abstract enumLiteral(type: Type): TypeWriter
  protected abstract intersection(type: Type): TypeWriter
  protected abstract union(type: Type): TypeWriter
  protected abstract literal(type: Type): TypeWriter
  protected abstract any(type: Type): TypeWriter
  protected abstract unknown(type: Type): TypeWriter
  protected abstract undefined(type: Type): TypeWriter
  protected abstract void(type: Type): TypeWriter
  protected abstract function(type: Type): TypeWriter
  protected abstract builtInObject(type: Type): TypeWriter
  protected abstract stringIndexedObject(type: Type): TypeWriter
  protected abstract numberIndexedObject(type: Type): TypeWriter
  protected abstract object(type: Type<ts.ObjectType>): TypeWriter
  protected abstract withGenerics(
    typeWriter: TypeWriter,
    type: Type,
  ): TypeWriter
  protected abstract never(type: Type): TypeWriter
}
