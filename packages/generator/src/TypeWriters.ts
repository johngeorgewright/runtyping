import { Symbol as CompilerSymbol, SymbolFlags, ts, Type } from 'ts-morph'
import { Tuple } from '.'
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
  *typeWriter(
    type: Type,
    {
      recursive = false,
      circular = false,
    }: {
      recursive?: boolean
      circular?: boolean
    } = {}
  ): TypeWriter {
    const closeGenericFunction =
      this.#requiresGenericFunction(type) && (yield* this.withGenerics(type))

    switch (true) {
      case circular:
      case recursive:
        yield* this.lazy(type)
        break

      case type.isEnumLiteral():
        yield* this.enumLiteral(type)
        break

      case type.isNever():
        yield* this.never(type)
        break

      case type.isNull():
        yield* this.null(type)
        break

      case type.isString():
        yield* this.string(type)
        break

      case type.isNumber():
        yield* this.number(type)
        break

      case type.isBoolean():
        yield* this.boolean(type)
        break

      case isArray(type):
        yield* this.array(type, getArrayElementType(type))
        break

      case type.isTuple():
        yield* Tuple.isVariadicTuple(type)
          ? this.variadicTuple(type)
          : this.tuple(type)
        break

      case type.isEnum():
        yield* this.enum(type)
        break

      case type.isIntersection():
        yield* this.intersection(type)
        break

      case type.isUnion():
        yield* this.union(type)
        break

      case type.isLiteral():
        yield* this.literal(type)
        break

      case type.isAny():
        yield* this.any(type)
        break

      case type.isUnknown():
        yield* this.unknown(type)
        break

      case type.isUndefined():
        yield* this.undefined(type)
        break

      case type.getText() === 'void':
        yield* this.void(type)
        break

      case type.getCallSignatures().length > 0:
        yield* this.function(type)
        break

      case type.isInterface():
      case type.isObject():
        switch (true) {
          case isBuiltInType(type):
            yield* this.builtInObject(type)
            break
          case !!type.getStringIndexType():
            yield* this.stringIndexedObject(type)
            break
          case !!type.getNumberIndexType():
            yield* this.numberIndexedObject(type)
            break
          default:
            yield* this.object(type as Type<ts.ObjectType>)
        }
        break

      default:
        try {
          yield [Write, getTypeName(type)]
        } catch (error) {
          yield* this.unknown(type)
        }
        break
    }

    if (closeGenericFunction) yield* closeGenericFunction()
  }

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
      whenOptional,
    }: {
      whenOptional?(propertyWriter: TypeWriter): TypeWriter
      properties?: CompilerSymbol[]
    }
  ): TypeWriter {
    const typeArguments = getGenerics(type).map((typeArgument) =>
      typeArgument.getText()
    )
    const typeWriter = this

    for (const property of properties) {
      yield* this.objectPropertyKey(property)
      const propertyType = property.getValueDeclarationOrThrow().getType()
      yield* property.hasFlags(SymbolFlags.Optional) && whenOptional
        ? whenOptional(propertyWriter(propertyType))
        : propertyWriter(propertyType)
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
    staticHelper: string
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
            type
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
      to?: number
    ): TypeWriter
    separator?(): TypeWriter
  }): TypeWriter {
    const types = Tuple.getTupleElements(tupleType)
    let variadicIndex
    for (let i = 0; i < types.length; i++) {
      if (separator) yield* separator()
      const { element: elementType, variadic } = types[i]
      if (variadic) {
        variadicIndex = i
        yield* variadicElement.call(
          this,
          elementType,
          i,
          i === types.length - 1 ? undefined : i - (types.length - 1)
        )
      } else
        yield* element.call(
          this,
          elementType,
          variadicIndex === undefined ? i : i - types.length
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
  protected abstract withGenerics(type: Type): TypeWriter<() => TypeWriter>
  protected abstract never(type: Type): TypeWriter
}
