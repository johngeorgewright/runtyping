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
    hasTypeDeclaration: (typeName: string) => boolean
  ) {
    const generator = new RuntypeGenerator(writer, hasTypeDeclaration)
    return generator.#generateType(type)
  }

  private constructor(
    writer: CodeBlockWriter,
    hasTypeDeclaration: (typeName: string) => boolean
  ) {
    this.#writer = writer
    this.#hasTypeDeclaration = hasTypeDeclaration
  }

  *#generatePossiblyReusableType(type: Type): TypeGenerator {
    const typeName = tryCatch(
      () => type.getSymbolOrThrow().getName(),
      () => null
    )

    if (typeName && this.#hasTypeDeclaration(typeName)) {
      yield [Variable, typeName]
      return yield [Writer, this.#writer.write(typeName)]
    }

    return yield* this.#generateType(type)
  }

  *#generateType(type: Type): TypeGenerator {
    switch (true) {
      case type.isString():
        return yield* this.#generateSimpleType('String')

      case type.isNumber():
        return yield* this.#generateSimpleType('Number')

      case type.isBoolean():
        return yield* this.#generateSimpleType('Boolean')

      case type.isArray():
        return yield* this.#generateArrayType(type)

      case type.isEnum():
        return yield* this.#generateEnumType(type)

      case type.isUnion():
        return yield* this.#generateUnionType(type)

      case type.isStringLiteral():
        yield [Import, 'Literal']
        return yield [Writer, this.#writer.write(`Literal(${type.getText()})`)]

      case type.isAny():
        return yield* this.#generateSimpleType('Unknown')

      case type.isUndefined():
        return yield* this.#generateSimpleType('Undefined')

      case type.isInterface():
      case type.isObject():
        return yield* this.#generateObjectType(type)

      default:
        throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
    }
  }

  /**
   * @todo Members is always empty
   */
  *#generateEnumType(type: Type): TypeGenerator {
    const members = type
      .getSymbolOrThrow()
      .getMembers()
      .map((member) => member.getDeclaredType())

    if (!members.length) return this.#writer

    let writer = yield* this.#generatePossiblyReusableType(members.shift()!)

    for (const member of members) {
      writer = yield [Writer, writer.write('.Or(')]
      writer = yield* this.#generatePossiblyReusableType(member)
      writer = yield [Writer, writer.write(')')]
    }

    return writer
  }

  *#generateSimpleType(type: string): TypeGenerator {
    yield [Import, type]
    return yield [Writer, this.#writer.write(type)]
  }

  *#generateArrayType(type: Type): TypeGenerator {
    yield [Import, 'Array']
    this.#writer = yield [Writer, this.#writer.write('Array(')]
    this.#writer = yield* this.#generatePossiblyReusableType(
      type.getArrayElementTypeOrThrow()
    )
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
      this.#writer = yield* this.#generatePossiblyReusableType(
        type.getStringIndexType()!
      )
      return yield [Writer, this.#writer.write(')')]
    }

    yield [Import, 'Record']
    this.#writer = yield [Writer, this.#writer.write('Record({')]
    for (const property of type.getProperties()) {
      this.#writer = yield [
        Writer,
        this.#writer.write(`${property.getName()}:`),
      ]
      this.#writer = yield* this.#generatePossiblyReusableType(
        property.getValueDeclarationOrThrow().getType()
      )
      this.#writer = yield [Writer, this.#writer.write(',')]
    }
    return yield [Writer, this.#writer.write('})')]
  }

  *#generateUnionType(type: Type): TypeGenerator {
    const [first, ...rest] = type
      .getUnionTypes()
      .sort(
        (a, b) =>
          Number(a.isUndefined()) - Number(b.isUndefined()) ||
          +(a > b) ||
          -(a < b)
      )

    if (!first) {
      yield [Import, 'Undefined']
      return yield [Writer, this.#writer.write('Undefined')]
    }

    this.#writer = yield* this.#generatePossiblyReusableType(first)
    for (const item of rest) {
      this.#writer = yield [Writer, this.#writer.write('.Or()')]
      this.#writer = yield* this.#generatePossiblyReusableType(item)
      this.#writer = yield [Writer, this.#writer.write(')')]
    }
    return this.#writer
  }
}
