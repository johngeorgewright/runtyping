import { tryCatch } from '@johngw/error'
import { CodeBlockWriter, Type } from 'ts-morph'

export const Writer = Symbol('Writer')
export const Import = Symbol('Import')
export const Variable = Symbol('Variable')

export type TypeGenerator = Generator<
  | [typeof Import, string]
  | [typeof Writer, CodeBlockWriter]
  | [typeof Variable, string],
  CodeBlockWriter,
  CodeBlockWriter
>

export default class RuntypeGenerator {
  #writer: CodeBlockWriter
  #hasTypeDeclaration: (typeName: string) => boolean

  static generateType(
    writer: CodeBlockWriter,
    type: Type,
    hasTypeDeclaration: (typeName: string) => boolean,
    isRecursive: boolean
  ) {
    const generator = new RuntypeGenerator(writer, hasTypeDeclaration)
    return generator.#generate(type, isRecursive)
  }

  private constructor(
    writer: CodeBlockWriter,
    hasTypeDeclaration: (typeName: string) => boolean
  ) {
    this.#writer = writer
    this.#hasTypeDeclaration = hasTypeDeclaration
  }

  *#generate(type: Type, isRecursive = false): TypeGenerator {
    if (isRecursive) {
      yield [Import, 'Lazy']
      this.#writer = yield [Writer, this.#writer.write('Lazy(() => ')]
    }

    switch (true) {
      case type.isString():
        this.#writer = yield* this.#generateSimpleType('String')
        break

      case type.isNumber():
        this.#writer = yield* this.#generateSimpleType('Number')
        break

      case type.isBoolean():
        this.#writer = yield* this.#generateSimpleType('Boolean')
        break

      case type.isArray():
        this.#writer = yield* this.#generateArrayType(type)
        break

      case type.isEnum():
        this.#writer = yield* this.#generateEnumType(type)
        break

      case type.isIntersection():
        this.#writer = yield* this.#generateIntersectionType(type)
        break

      case type.isUnion():
        this.#writer = yield* this.#generateUnionType(type)
        break

      case type.isLiteral():
        yield [Import, 'Literal']
        this.#writer = yield [
          Writer,
          this.#writer.write(`Literal(${type.getText()})`),
        ]
        break

      case type.isAny():
        this.#writer = yield* this.#generateSimpleType('Unknown')
        break

      case type.isUndefined():
        this.#writer = yield* this.#generateSimpleType('Undefined')
        break

      case type.isInterface():
      case type.isObject():
        this.#writer = yield* this.#generateObjectType(type)
        break

      default:
        throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
    }

    if (isRecursive) {
      this.#writer = yield [Writer, this.#writer.write(')')]
    }

    return this.#writer
  }

  *#generateType(type: Type): TypeGenerator {
    const typeName = tryCatch(
      () => type.getSymbolOrThrow().getName(),
      () => null
    )

    if (typeName && this.#hasTypeDeclaration(typeName)) {
      yield [Variable, typeName]
      return yield [Writer, this.#writer.write(typeName)]
    }

    return yield* this.#generate(type)
  }

  /**
   * @todo Members is always empty
   */
  *#generateEnumType(type: Type): TypeGenerator {
    const [first, ...members] = type
      .getSymbolOrThrow()
      .getMembers()
      .map((member) => member.getDeclaredType())

    if (!first) return yield* this.#generateSimpleType('Undefined')

    this.#writer = yield* this.#generateType(first)

    for (const member of members) {
      this.#writer = yield [Writer, this.#writer.write('.Or(')]
      this.#writer = yield* this.#generateType(member)
      this.#writer = yield [Writer, this.#writer.write(')')]
    }

    return this.#writer
  }

  *#generateSimpleType(type: string): TypeGenerator {
    yield [Import, type]
    return yield [Writer, this.#writer.write(type)]
  }

  *#generateArrayType(type: Type): TypeGenerator {
    yield [Import, 'Array']
    this.#writer = yield [Writer, this.#writer.write('Array(')]
    this.#writer = yield* this.#generateType(type.getArrayElementTypeOrThrow())
    return yield [Writer, this.#writer.write(')')]
  }

  *#generateObjectType(type: Type): TypeGenerator {
    const isBuiltInType = type
      .getSymbolOrThrow()
      .getDeclarations()
      .some((d) =>
        d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
      )

    if (isBuiltInType) {
      yield [Import, 'InstanceOf']
      return yield [Writer, this.#writer.write(`InstanceOf(${type.getText()})`)]
    }

    if (type.getStringIndexType()) {
      yield [Import, 'Dictionary']
      yield [Import, 'String']
      this.#writer = yield [Writer, this.#writer.write('Dictionary(')]
      this.#writer = yield* this.#generateType(type.getStringIndexType()!)
      return yield [Writer, this.#writer.write(', String)')]
    } else if (type.getNumberIndexType()) {
      yield [Import, 'Dictionary']
      yield [Import, 'Number']
      this.#writer = yield [Writer, this.#writer.write('Dictionary(')]
      this.#writer = yield* this.#generateType(type.getStringIndexType()!)
      return yield [Writer, this.#writer.write(', Number)')]
    }

    yield [Import, 'Record']
    this.#writer = yield [Writer, this.#writer.write('Record({')]
    for (const property of type.getProperties()) {
      this.#writer = yield [
        Writer,
        this.#writer.write(`${property.getName()}:`),
      ]
      this.#writer = yield* this.#generateType(
        property.getValueDeclarationOrThrow().getType()
      )
      this.#writer = yield [Writer, this.#writer.write(',')]
    }
    return yield [Writer, this.#writer.write('})')]
  }

  *#generateIntersectionType(type: Type): TypeGenerator {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)

    if (!first) return yield* this.#generateSimpleType('Undefined')

    this.#writer = yield* this.#generateType(first)
    for (const item of rest) {
      this.#writer = yield [Writer, this.#writer.write('.And(')]
      this.#writer = yield* this.#generateType(item)
      this.#writer = yield [Writer, this.#writer.write(')')]
    }
    return this.#writer
  }

  *#generateUnionType(type: Type): TypeGenerator {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

    if (!first) return yield* this.#generateSimpleType('Undefined')

    this.#writer = yield* this.#generateType(first)
    for (const item of rest) {
      this.#writer = yield [Writer, this.#writer.write('.Or(')]
      this.#writer = yield* this.#generateType(item)
      this.#writer = yield [Writer, this.#writer.write(')')]
    }
    return this.#writer
  }
}

function sortUndefinedFirst(a: Type, b: Type) {
  return (
    Number(a.isUndefined()) - Number(b.isUndefined()) || +(a > b) || -(a < b)
  )
}
