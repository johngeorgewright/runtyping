import { OptionalKind, TypeParameterDeclarationStructure } from 'ts-morph'
import { ImportSpec, NamedImportSpec } from './runtypes'

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
export const StaticParameters = Symbol.for(
  '@runtypes/generator/TypeWriter/StaticParameters'
)

export type TypeWriter<R = any> = Generator<
  | [action: typeof Import, importDeclaration: ImportSpec]
  | [
      action: typeof ImportFromSource,
      importDeclaration: Omit<NamedImportSpec, 'source'>
    ]
  | [action: typeof Write, contents: string]
  | [action: typeof DeclareAndUse, name: string]
  | [action: typeof DeclareType, type: string]
  | [action: typeof Static, staticImplementation: string]
  | [
      action: typeof StaticParameters,
      parameters: (string | OptionalKind<TypeParameterDeclarationStructure>)[]
    ],
  R,
  undefined | boolean
>
