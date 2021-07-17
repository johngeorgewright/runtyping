import { tryCatch } from '@johngw/error'
import { Type } from 'ts-morph'

export const Write = Symbol('Write')
export const Import = Symbol('Import')
export const Declare = Symbol('Declare')

export type TypeGenerator = Generator<
  [typeof Import, string] | [typeof Write, string] | [typeof Declare, string]
>

export default class RuntypeGenerator {
  #hasTypeDeclaration: (typeName: string) => boolean

  static generateType(
    type: Type,
    hasTypeDeclaration: (typeName: string) => boolean,
    isRecursive: boolean
  ) {
    const generator = new RuntypeGenerator(hasTypeDeclaration)
    return generator.#generate(type, isRecursive)
  }

  private constructor(hasTypeDeclaration: (typeName: string) => boolean) {
    this.#hasTypeDeclaration = hasTypeDeclaration
  }

  *#generate(type: Type, isRecursive = false): TypeGenerator {
    if (isRecursive) {
      yield [Import, 'Lazy']
      yield [Write, 'Lazy(() => ']
    }

    switch (true) {
      case type.isString():
        yield* this.#generateSimpleType('String')
        break

      case type.isNumber():
        yield* this.#generateSimpleType('Number')
        break

      case type.isBoolean():
        yield* this.#generateSimpleType('Boolean')
        break

      case type.isArray():
        yield* this.#generateArrayType(type)
        break

      case type.isEnum():
        yield* this.#generateEnumType(type)
        break

      case type.isIntersection():
        yield* this.#generateIntersectionType(type)
        break

      case type.isUnion():
        yield* this.#generateUnionType(type)
        break

      case type.isLiteral():
        yield [Import, 'Literal']
        yield [Write, `Literal(${type.getText()})`]
        break

      case type.isAny():
        yield* this.#generateSimpleType('Unknown')
        break

      case type.isUndefined():
        yield* this.#generateSimpleType('Undefined')
        break

      case type.isInterface():
      case type.isObject():
        yield* this.#generateObjectType(type)
        break

      default:
        throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
    }

    if (isRecursive) {
      yield [Write, ')']
    }
  }

  *#generateType(type: Type): TypeGenerator {
    const typeName = tryCatch(
      () => type.getSymbolOrThrow().getName(),
      () => null
    )

    if (typeName && this.#hasTypeDeclaration(typeName)) {
      yield [Declare, typeName]
      yield [Write, typeName]
      return
    }

    yield* this.#generate(type)
  }

  /**
   * @todo Members is always empty
   */
  *#generateEnumType(type: Type): TypeGenerator {
    const [first, ...members] = type
      .getSymbolOrThrow()
      .getMembers()
      .map((member) => member.getDeclaredType())

    if (!first) {
      yield* this.#generateSimpleType('Undefined')
      return
    }

    yield* this.#generateType(first)

    for (const member of members) {
      yield [Write, '.Or(']
      yield* this.#generateType(member)
      yield [Write, ')']
    }
  }

  *#generateSimpleType(type: string): TypeGenerator {
    yield [Import, type]
    yield [Write, type]
  }

  *#generateArrayType(type: Type): TypeGenerator {
    yield [Import, 'Array']
    yield [Write, 'Array(']
    yield* this.#generateType(type.getArrayElementTypeOrThrow())
    yield [Write, ')']
  }

  *#generateObjectType(type: Type): TypeGenerator {
    const isBuiltInType = type
      .getSymbolOrThrow()
      .getDeclarations()
      .some((d) =>
        d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
      )

    if (isBuiltInType) {
      yield* this.#generateBuildInType(type)
      return
    }

    if (type.getStringIndexType()) {
      yield* this.#generateStringIndexType(type)
      return
    } else if (type.getNumberIndexType()) {
      yield* this.#generateNumberIndexType(type)
      return
    }

    yield [Import, 'Record']
    yield [Write, 'Record({']
    for (const property of type.getProperties()) {
      yield [Write, `${property.getName()}:`]
      yield* this.#generateType(property.getValueDeclarationOrThrow().getType())
      yield [Write, ',']
    }
    yield [Write, '})']
  }

  *#generateBuildInType(type: Type): TypeGenerator {
    yield [Import, 'InstanceOf']
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  *#generateStringIndexType(type: Type): TypeGenerator {
    yield [Import, 'Dictionary']
    yield [Import, 'String']
    yield [Write, 'Dictionary(']
    yield* this.#generateType(type.getStringIndexType()!)
    yield [Write, ', String)']
  }

  *#generateNumberIndexType(type: Type): TypeGenerator {
    yield [Import, 'Dictionary']
    yield [Import, 'Number']
    yield [Write, 'Dictionary(']
    yield* this.#generateType(type.getNumberIndexType()!)
    yield [Write, ', Number)']
  }

  *#generateIntersectionType(type: Type): TypeGenerator {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)

    if (!first) {
      yield* this.#generateSimpleType('Undefined')
      return
    }

    yield* this.#generateType(first)
    for (const item of rest) {
      yield [Write, '.And(']
      yield* this.#generateType(item)
      yield [Write, ')']
    }
  }

  *#generateUnionType(type: Type): TypeGenerator {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

    if (!first) {
      yield* this.#generateSimpleType('Undefined')
      return
    }

    yield* this.#generateType(first)
    for (const item of rest) {
      yield [Write, '.Or(']
      yield* this.#generateType(item)
      yield [Write, ')']
    }
  }
}

function sortUndefinedFirst(a: Type, b: Type) {
  return (
    Number(a.isUndefined()) - Number(b.isUndefined()) || +(a > b) || -(a < b)
  )
}
