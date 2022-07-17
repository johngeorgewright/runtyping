import { ts, Type } from 'ts-morph'

export const Write = Symbol.for('@runtypes/generator/TypeWriter/Write')
export const Import = Symbol.for('@runtypes/generator/TypeWriter/Import')
export const ImportFromSource = Symbol.for(
  '@runtypes/generator/TypeWriter/ImportFromSource'
)
export const DeclareAndUse = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareAndUse'
)
export const DeclareType = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareType'
)
export const Static = Symbol.for('@runtypes/generator/TypeWriter/Static')

export type TypeWriter<R = any> = Generator<
  | [action: typeof Import, runtypeName: string]
  | [
      action: typeof ImportFromSource,
      sourceType: { name: string; alias: string }
    ]
  | [action: typeof Write, contents: string]
  | [action: typeof DeclareAndUse, name: string]
  | [action: typeof DeclareType, type: string]
  | [action: typeof Static, staticImplementation: string],
  R,
  undefined | boolean
>

export abstract class TypeWriterFactory {
  typeWriter(
    type: Type,
    {
      recursive = false,
      circular = false,
    }: { recursive?: boolean; circular?: boolean } = {}
  ): TypeWriter {
    switch (true) {
      case circular:
      case recursive:
        return this.lazy(type)

      case type.isEnumLiteral():
        return this.enumLiteral(type)

      case type.isNull():
        return this.null(type)

      case type.isString():
        return this.string(type)

      case type.isNumber():
        return this.number(type)

      case type.isBoolean():
        return this.boolean(type)

      case type.isArray():
        return this.array(type)

      case type.isTuple():
        return this.tuple(type)

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
            return this.object(type)
        }

      default:
        throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
    }
  }

  *generateOrReuseType(type: Type): TypeWriter {
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

  protected abstract lazy(type: Type): TypeWriter
  protected abstract null(type: Type): TypeWriter
  protected abstract string(type: Type): TypeWriter
  protected abstract number(type: Type): TypeWriter
  protected abstract boolean(type: Type): TypeWriter
  protected abstract array(type: Type): TypeWriter
  protected abstract tuple(type: Type): TypeWriter
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
  protected abstract object(type: Type): TypeWriter
}

function isBuiltInType(type: Type) {
  return type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) => {
      if (d.getSourceFile().compilerNode.hasNoDefaultLib) {
        const name = type.getSymbolOrThrow().getName()
        const parent = d.getParentOrThrow()
        const siblings = (
          [
            ts.SyntaxKind.ClassDeclaration,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.VariableDeclaration,
          ] as const
        ).flatMap((x) => parent.getChildrenOfKind(x))
        return siblings.some((x) => x.getName() === name)
      }
      return false
    })
}
