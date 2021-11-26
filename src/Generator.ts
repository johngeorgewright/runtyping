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
  DeclareAndUse,
  Import,
  ImportFromSource,
  Static,
  Write,
} from './typeWriter/symbols'
import typeNameFormatter, { TypeNameFormatter } from './typeNameFormatter'
import { DeclaredType } from './typeWriter/TypeWriter'

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

type SourceCodeFile = SourceFile

export default class Generator {
  #exports = new Set<string>()
  #formatRuntypeName: TypeNameFormatter
  #formatTypeName: TypeNameFormatter
  #project: Project
  #runtypesImports = new Set<string>()
  #targetFile: SourceCodeFile

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
      const sourceImports = new Set<{ name: string; alias: string }>()

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

  #addSourceImports(
    sourceFilePath: string,
    imports: Set<{ name: string; alias: string }>
  ) {
    const sourceDir = dirname(sourceFilePath)
    const targetDir = dirname(this.#targetFile.getFilePath())
    const sourceBaseName = basename(sourceFilePath, extname(sourceFilePath))
    this.#targetFile.addImportDeclaration({
      namedImports: [...imports].map(({ name, alias }) => ({
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
    sourceImports: Set<{ name: string; alias: string }>
  ) {
    const schema = await compileFromFile(sourceType.file)
    const sourceFile = this.#project.createSourceFile(
      `__temp__${sourceType.file}.ts`,
      schema
    )
    this.#generateRuntype(
      {
        ...sourceType,
        file: sourceFile.getFilePath(),
      },
      sourceImports
    )
    this.#project.removeSourceFile(sourceFile)
  }

  #generateRuntype(
    sourceType: InstructionSourceType,
    sourceImports: Set<{ name: string; alias: string }>
  ) {
    const sourceFile = this.#project.addSourceFileAtPath(sourceType.file)
    for (const type of castArray(sourceType.type))
      if (!this.#exports.has(type))
        this.#writeRuntype(
          sourceFile,
          type,
          sourceImports,
          sourceType.exportStaticType
        )
  }

  #writeRuntype(
    sourceFile: SourceCodeFile,
    sourceType: string,
    sourceImports: Set<{ name: string; alias: string }>,
    exportStaticType = true
  ): DeclaredType {
    const runTypeName = this.#formatRuntypeName(
      this.#getAliasName(sourceFile, sourceType)
    )
    const typeName = this.#formatTypeName(
      this.#getAliasName(sourceFile, sourceType)
    )
    const typeDeclaration = this.#getTypeDeclaration(sourceFile, sourceType)
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
      .handle(Declare, (value): DeclaredType => {
        return !recursive && !this.#exports.has(value)
          ? this.#writeRuntype(sourceFile, value, sourceImports)
          : // TODO: this probably isn't right
            { runTypeName: value, typeName: value }
      })
      .handle(DeclareAndUse, (value) => {
        let next: true | undefined
        if (recursive || this.#hasTypeDeclaration(sourceFile, value)) {
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
          name: runTypeName,
          initializer: writer.toString(),
        },
      ],
    })

    if (exportStaticType) {
      if (!staticImplementation) {
        this.#runtypesImports.add('Static')
        staticImplementation = `Static<typeof ${runTypeName}>`
      }

      this.#targetFile.addTypeAlias({
        isExported: true,
        name: typeName,
        type: staticImplementation,
      })
    }

    this.#exports.add(sourceType)

    return {
      runTypeName,
      typeName,
    }
  }

  #getTypeDeclaration(
    sourceFile: SourceCodeFile,
    typeName: string
  ): ConsideredTypeDeclaration {
    const importTypeDeclaration = this.#getImportedTypeDeclaration(typeName)
    if (importTypeDeclaration) return importTypeDeclaration

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

  #getImportedTypeDeclaration(typeName: string) {
    const match = importTypeNameRegExp(typeName)
    if (!match) return
    return this.#getTypeDeclaration(
      this.#project.addSourceFileAtPath(
        /\.(?:ts|mts|cts)$/.test(match.importPath)
          ? match.importPath
          : `${match.importPath}.ts`
      ),
      match.importTypeName
    )
  }

  #getAliasName(sourceFile: SourceCodeFile, typeName: string) {
    const match = importTypeNameRegExp(typeName)
    if (!match) return typeName
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
      for (const namedImport of importDeclaration.getNamedImports()) {
        const text = namedImport.getText()
        if (text.startsWith(`${match.importTypeName} as `))
          return text.replace(`${match.importTypeName} as `, '')
        else if (text === match.importTypeName) return text
      }
    }
    return typeName
  }

  #hasTypeDeclaration(sourceFile: SourceCodeFile, typeName: string) {
    try {
      return !!this.#getTypeDeclaration(sourceFile, typeName)
    } catch (error) {
      return false
    }
  }
}

function importTypeNameRegExp(typeName: string) {
  const match = /^import\("([\/\\\w\.-]+)"\)\.(\w+)$/.exec(typeName)
  return (
    match && {
      importPath: match[1],
      importTypeName: match[2],
    }
  )
}

function isRecursive(typeDeclaration: ConsideredTypeDeclaration) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}

type ConsideredTypeDeclaration =
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | VariableDeclaration
