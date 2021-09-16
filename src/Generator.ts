import { cast as castArray } from '@johngw/array'
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

type GeneratorOptionsBase =
  | {
      targetFile: string
      tsConfigFile?: string
    }
  | {
      targetFile: string
      project?: Project
    }

type StringMapper = (type: string) => string

export type GeneratorOptions = GeneratorOptionsBase & {
  mapRuntypeName?: StringMapper
}

export default class Generator {
  #exports = new Set<string>()
  #mapRuntypeName: StringMapper
  #project: Project
  #runtypesImports = new Set<string>()
  #targetFile: SourceFile

  constructor(options: GeneratorOptions) {
    this.#mapRuntypeName = options.mapRuntypeName ?? ((str) => str)

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
  }

  async generate(sourceTypes: InstructionSourceType | InstructionSourceType[]) {
    for (const sourceType of castArray(sourceTypes)) {
      const sourceImports = new Set<string>()

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

  #addSourceImports(sourceFilePath: string, imports: Set<string>) {
    const sourceDir = dirname(sourceFilePath)
    const targetDir = dirname(this.#targetFile.getFilePath())
    const sourceBaseName = basename(sourceFilePath, extname(sourceFilePath))
    const moduleSpecifier = `${
      relative(targetDir, sourceDir) || '.'
    }/${sourceBaseName}`
    this.#targetFile.addImportDeclaration({
      namedImports: [...imports].map((name) => ({
        name,
        alias: `_${name}`,
      })),
      moduleSpecifier,
    })
  }

  async #generateRuntypeFromJSON(
    sourceType: InstructionSourceType,
    sourceImports: Set<string>
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
    sourceImports: Set<string>
  ) {
    const sourceFile = this.#project.addSourceFileAtPath(sourceType.file)
    for (const type of castArray(sourceType.type)) {
      if (!this.#exports.has(type))
        this.#writeRuntype(sourceFile, type, sourceImports)
    }
  }

  #writeRuntype(
    sourceFile: SourceFile,
    sourceType: string,
    sourceImports: Set<string>
  ) {
    const sourceTypeRt = this.#mapRuntypeName(sourceType)
    const typeDeclaration = getTypeDeclaration(sourceFile, sourceType)
    const recursive = isRecursive(typeDeclaration)
    const generator = factory(
      typeDeclaration.getType(),
      typeDeclaration.getName()
    )
    let staticImplementation = `Static<typeof ${sourceTypeRt}>`
    let writer = this.#project.createWriter()

    if (recursive) {
      this.#runtypesImports.add('Lazy')
      writer = writer.write('Lazy(() => ')
    }

    let item = generator.next()

    while (!item.done) {
      let next: true | undefined

      switch (item.value[0]) {
        case Write:
          writer = writer.write(item.value[1])
          break

        case Import:
          this.#runtypesImports.add(item.value[1])
          break

        case ImportFromSource:
          sourceImports.add(item.value[1])
          break

        case Declare:
          if (recursive || hasTypeDeclaration(sourceFile, item.value[1])) {
            next = true
            writer = writer.write(this.#mapRuntypeName(item.value[1]))
          }
          if (next && !recursive && !this.#exports.has(item.value[1]))
            this.#writeRuntype(sourceFile, item.value[1], sourceImports)
          break

        case Static:
          staticImplementation = item.value[1]
          break
      }

      item = generator.next(next)
    }

    if (recursive) {
      writer = writer.write(')')
    }

    this.#targetFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: sourceTypeRt,
          initializer: writer.toString(),
        },
      ],
    })

    this.#runtypesImports.add('Static')

    this.#targetFile.addTypeAlias({
      isExported: true,
      name: sourceType,
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
