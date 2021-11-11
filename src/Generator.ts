import { cast as castArray } from '@johngw/array'
import { IteratorHandler } from '@johngw/iterator'
import { compileFromFile } from 'json-schema-to-typescript'
import { basename, dirname, extname, relative } from 'path'
import {
  EnumDeclaration,
  FunctionDeclaration,
  IndentationText,
  InterfaceDeclaration,
  NewLineKind,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { InstructionSourceType } from './runtypes'
import factory from './typeWriter/factory'
import {
  Declare,
  Import,
  ImportFromSource,
  Static,
  Write,
} from './typeWriter/symbols'
import typeNameFormatter, { TypeNameFormatter } from './typeNameFormatter'

type GeneratorOptionsBase =
  | {
      targetFile: string
      tsConfigFile?: string
    }
  | {
      targetFile: string
      project?: Project
    }

export type GeneratorOptions = GeneratorOptionsBase & {
  runtypeFormat?: string
  typeFormat?: string
}

export default class Generator {
  #exports = new Set<string>()
  #formatRuntypeName: TypeNameFormatter
  #formatTypeName: TypeNameFormatter
  #project: Project
  #runtypesImports = new Set<string>()
  #targetFile: SourceFile

  constructor(options: GeneratorOptions) {
    this.#project =
      'project' in options && options.project
        ? options.project
        : new Project({
            compilerOptions: { strictNullChecks: true },
            manipulationSettings: {
              indentationText: IndentationText.TwoSpaces,
              newLineKind: NewLineKind.LineFeed,
              quoteKind: QuoteKind.Single,
              usePrefixAndSuffixTextForRename: false,
              useTrailingCommas: true,
            },
            skipAddingFilesFromTsConfig: true,
            tsConfigFilePath:
              'tsConfigFile' in options ? options.tsConfigFile : undefined,
          })

    this.#targetFile = this.#project.createSourceFile(options.targetFile, '', {
      overwrite: true,
    })

    this.#formatRuntypeName = typeNameFormatter(options.runtypeFormat)
    this.#formatTypeName = typeNameFormatter(options.typeFormat)
  }

  async generate(sourceTypes: InstructionSourceType | InstructionSourceType[]) {
    for (const sourceType of castArray(sourceTypes)) {
      const sourceImports = new Set<[string, string]>()

      switch (extname(sourceType.file)) {
        case '.json':
          await this.#generateRuntypeFromJSON(sourceType, sourceImports)
          break

        case '.d.ts':
        case '.ts':
          this.#generateRuntype(sourceType, sourceImports)
          break

        default:
          throw new Error(`${sourceType.file} is not a typescript or json file`)
      }

      if (sourceImports.size) {
        this.#addSourceImports(sourceType.file, sourceImports)
      }
    }

    this.#targetFile.addImportDeclaration({
      namedImports: [...this.#runtypesImports],
      moduleSpecifier: 'runtypes',
    })

    this.#targetFile.formatText()
    return this.#targetFile
  }

  #addSourceImports(sourceFilePath: string, imports: Set<[string, string]>) {
    const sourceDir = dirname(sourceFilePath)
    const targetDir = dirname(this.#targetFile.getFilePath())
    const sourceBaseName = basename(sourceFilePath, extname(sourceFilePath))
    this.#targetFile.addImportDeclaration({
      namedImports: [...imports].map(([name, alias]) => ({
        name,
        alias,
      })),
      moduleSpecifier: `${
        relative(targetDir, sourceDir) || '.'
      }/${sourceBaseName}`,
    })
  }

  async #generateRuntypeFromJSON(
    sourceType: InstructionSourceType,
    sourceImports: Set<[string, string]>
  ) {
    const schema = await compileFromFile(sourceType.file)
    const sourceFile = this.#project.createSourceFile(
      `__temp__${sourceType.file}.ts`,
      schema
    )
    this.#generateRuntype(
      {
        file: sourceFile.getFilePath(),
        type: sourceType.type,
      },
      sourceImports
    )
    this.#project.removeSourceFile(sourceFile)
  }

  #generateRuntype(
    sourceType: InstructionSourceType,
    sourceImports: Set<[string, string]>
  ) {
    const sourceFile = this.#project.addSourceFileAtPath(sourceType.file)
    for (const type of castArray(sourceType.type))
      if (!this.#exports.has(type))
        this.#writeRuntype(sourceFile, type, sourceImports)
  }

  #writeRuntype(
    sourceFile: SourceFile,
    sourceType: string,
    sourceImports: Set<[string, string]>
  ) {
    const sourceTypeName = this.#formatRuntypeName(sourceType)
    const typeDeclaration = getTypeDeclaration(sourceFile, sourceType)
    const recursive = isRecursive(typeDeclaration)

    let staticImplementation: string | undefined
    let writer = this.#project.createWriter()

    if (recursive) {
      this.#runtypesImports.add('Lazy')
      writer = writer.write('Lazy(() => ')
    }

    IteratorHandler.create(
      factory(typeDeclaration.getType(), typeDeclaration.getName())
    )
      .handle(Write, (value) => {
        writer = writer.write(value)
      })
      .handle(Import, (value) => {
        this.#runtypesImports.add(value)
      })
      .handle(ImportFromSource, (value) => {
        sourceImports.add(value)
      })
      .handle(Static, (value) => {
        staticImplementation = value
      })
      .handle(Declare, (value) => {
        let next: true | undefined
        if (recursive || hasTypeDeclaration(sourceFile, value)) {
          next = true
          writer = writer.write(this.#formatRuntypeName(value))
        }
        if (next && !recursive && !this.#exports.has(value))
          this.#writeRuntype(sourceFile, value, sourceImports)
        return next
      })
      .run()

    if (recursive) {
      writer = writer.write(')')
    }

    this.#targetFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: sourceTypeName,
          initializer: writer.toString(),
        },
      ],
    })

    if (!staticImplementation) {
      this.#runtypesImports.add('Static')
      staticImplementation = `Static<typeof ${sourceTypeName}>`
    }

    this.#targetFile.addTypeAlias({
      isExported: true,
      name: this.#formatTypeName(sourceType),
      type: staticImplementation,
    })

    this.#exports.add(sourceType)
  }
}

function getTypeDeclaration(sourceFile: SourceFile, typeName: string) {
  const declaration =
    sourceFile.getInterface(typeName) ||
    sourceFile.getTypeAlias(typeName) ||
    sourceFile.getEnum(typeName) ||
    sourceFile.getFunction(typeName) ||
    sourceFile.getVariableDeclaration(typeName)

  if (!declaration)
    throw new Error(
      `Cannot find any interface, type or enum called "${typeName}" in ${sourceFile.getFilePath()}.`
    )

  return declaration
}

function hasTypeDeclaration(sourceFile: SourceFile, typeName: string) {
  try {
    return !!getTypeDeclaration(sourceFile, typeName)
  } catch (error) {
    return false
  }
}

function isRecursive(
  typeDeclaration:
    | InterfaceDeclaration
    | TypeAliasDeclaration
    | EnumDeclaration
    | FunctionDeclaration
    | VariableDeclaration
) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}
