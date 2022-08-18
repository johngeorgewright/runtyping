import { ts, Type } from 'ts-morph'
import { Tuple } from '.'
import {
  DeclareAndUse,
  ImportFromSource,
  Static,
  StaticParameters,
  TypeWriter,
  Write,
} from './TypeWriter'
import { getGenerics, getTypeName, isBuiltInType } from './util'

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
    switch (true) {
      case circular:
      case recursive:
        return yield* this.lazy(type)

      case type.isEnumLiteral():
        return yield* this.enumLiteral(type)

      case type.isNull():
        return yield* this.null(type)

      case type.isString():
        return yield* this.string(type)

      case type.isNumber():
        return yield* this.number(type)

      case type.isBoolean():
        return yield* this.boolean(type)

      case type.isArray():
        return yield* this.array(type)

      case type.isTuple():
        return yield* Tuple.isVariadicTuple(type)
          ? this.variadicTuple(type)
          : this.tuple(type)

      case type.isEnum():
        return yield* this.enum(type)

      case type.isIntersection():
        return yield* this.intersection(type)

      case type.isUnion():
        return yield* this.union(type)

      case type.isLiteral():
        return yield* this.literal(type)

      case type.isAny():
        return yield* this.any(type)

      case type.isUnknown():
        return yield* this.unknown(type)

      case type.isUndefined():
        return yield* this.undefined(type)

      case type.getText() === 'void':
        return yield* this.void(type)

      case type.getCallSignatures().length > 0:
        return yield* this.function(type)

      case type.isInterface():
      case type.isObject():
        switch (true) {
          case isBuiltInType(type):
            return yield* this.builtInObject(type)
          case !!type.getStringIndexType():
            return yield* this.stringIndexedObject(type)
          case !!type.getNumberIndexType():
            return yield* this.numberIndexedObject(type)
          case !!getGenerics(type).length:
            return yield* this.genericObject(type as Type<ts.ObjectType>)
          default:
            return yield* this.object(type as Type<ts.ObjectType>)
        }

      default:
        throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
    }
  }

  protected *generateOrReuseType(type: Type): TypeWriter {
    const typeName =
      type.getAliasSymbol()?.getName() || type.getSymbol()?.getName()

    if (
      !!typeName &&
      !type.isEnumLiteral() &&
      (yield [DeclareAndUse, typeName])
    )
      return

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

  protected *objectFunction(
    objectType: Type<ts.ObjectType>,
    baseType: string,
    staticHelper: string
  ): TypeWriter {
    const generics = getGenerics(objectType)
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
    yield* this.object(objectType)

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
      `${staticHelper}<ReturnType<typeof ${getTypeName(
        objectType
      )}<${generics.map((generic) => generic.getText())}>>>`,
    ]
  }

  abstract defaultStaticImplementation(type: Type): TypeWriter
  protected abstract lazy(type: Type): TypeWriter
  protected abstract null(type: Type): TypeWriter
  protected abstract string(type: Type): TypeWriter
  protected abstract number(type: Type): TypeWriter
  protected abstract boolean(type: Type): TypeWriter
  protected abstract array(type: Type): TypeWriter
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
  protected abstract genericObject(type: Type<ts.ObjectType>): TypeWriter
}
