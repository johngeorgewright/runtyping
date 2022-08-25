import { OptionalKind, Type, TypeParameterDeclarationStructure } from 'ts-morph'
import { ImportSpec } from './Generator'

export const CanDeclareStatics = Symbol.for(
  '@runtypes/generator/TypeWriter/CanDeclareStatics'
)
export const DeclareAndUse = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareAndUse'
)
export const DeclareType = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareType'
)
export const Import = Symbol.for('@runtypes/generator/TypeWriter/Import')
export const ImportFromSource = Symbol.for(
  '@runtypes/generator/TypeWriter/ImportFromSource'
)
export const Static = Symbol.for('@runtypes/generator/TypeWriter/Static')
export const StaticParameters = Symbol.for(
  '@runtypes/generator/TypeWriter/StaticParameters'
)
export const Write = Symbol.for('@runtypes/generator/TypeWriter/Write')

export type TypeWriter<R = any> = Generator<
  | [action: typeof CanDeclareStatics, type: Type]
  | [action: typeof Import, importDeclaration: ImportSpec]
  | [
      action: typeof ImportFromSource,
      sourceType: { name: string; alias: string }
    ]
  | [action: typeof Write, contents: string]
  | [action: typeof DeclareAndUse, name: string]
  | [action: typeof DeclareType, type: string]
  | [
      action: typeof Static,
      implementation: [type: Type, staticImplementation: string]
    ]
  | [
      action: typeof StaticParameters,
      implementation: [
        type: Type,
        parameters: (string | OptionalKind<TypeParameterDeclarationStructure>)[]
      ]
    ],
  R,
  undefined | boolean
>
