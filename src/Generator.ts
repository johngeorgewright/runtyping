import { cast as castArray } from '@johngw/array'
import { IteratorHandler } from '@johngw/iterator'
import { compileFromFile } from 'json-schema-to-typescript'
import { dirname, extname, isAbsolute, resolve as resolvePath } from 'path'
import {
  EnumDeclaration,
  FunctionDeclaration,
  IndentationText,
  InterfaceDeclaration,
  NewLineKind,
  Node,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind,
  ts,
  TypeAliasDeclaration,
  VariableDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { InstructionSourceType } from './runtypes'
import factory from './typeWriter/factory'
import {
  Declare,
  DeclareAndUse,
  DeclareType,
  Import,
  ImportFromSource,
  Static,
  Write,
} from './typeWriter/symbols'
import typeNameFormatter, { TypeNameFormatter } from './typeNameFormatter'
import { DeclaredType } from './typeWriter/TypeWriter'
import { doInModule, find, findInModule, getRelativeImportPath } from './util'

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
  #circularReferences = new Set<string>()
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

  get project() {
    return this.#project
  }

  async generate(sourceTypes: InstructionSourceType | InstructionSourceType[]) {
    for (const sourceType of castArray(sourceTypes)) {
      const sourceImports = new Map<string, string>()

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

  #addSourceImports(sourceFilePath: string, imports: Map<string, string>) {
    this.#targetFile.addImportDeclaration({
      namedImports: [...imports].map(([name, alias]) => ({
        name,
        alias,
      })),
      moduleSpecifier: getRelativeImportPath(
        this.#targetFile.getFilePath(),
        sourceFilePath
      ),
    })
  }

  async #generateRuntypeFromJSON(
    sourceType: InstructionSourceType,
    sourceImports: Map<string, string>
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
    sourceImports: Map<string, string>
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
    sourceImports: Map<string, string>,
    exportStaticType = true
  ): DeclaredType {
    const sourceTypeLocalName = this.#getLocalName(sourceFile, sourceType)
    const runTypeName = this.#formatRuntypeName(sourceTypeLocalName)
    const typeName = this.#formatTypeName(sourceTypeLocalName)
    const typeDeclaration = this.#getTypeDeclaration(sourceFile, sourceType)
    const recursive = isRecursive(typeDeclaration)
    const circular = isCircular(typeDeclaration)

    let staticImplementation: string | undefined
    let writer = this.#project.createWriter()
    let runTypeType: string | undefined

    if (circular) this.#circularReferences.add(typeName)

    IteratorHandler.create(
      factory(typeDeclaration.getType(), typeDeclaration.getName(), {
        recursive,
        circular,
      })
    )
      .handle(Write, (value) => {
        writer = writer.write(value)
      })
      .handle(Import, (value) => {
        this.#runtypesImports.add(value)
      })
      .handle(ImportFromSource, ({ name, alias }) => {
        sourceImports.set(name, alias)
      })
      .handle(Static, (value) => {
        staticImplementation = value
      })
      .handle(Declare, (value): DeclaredType => {
        const typeName = this.#getLocalName(sourceFile, value)
        return !recursive && !this.#exports.has(typeName)
          ? this.#writeRuntype(
              sourceFile,
              typeName,
              sourceImports,
              exportStaticType
            )
          : // TODO: this probably isn't right
            { runTypeName: typeName, typeName: typeName }
      })
      .handle(DeclareAndUse, (value) => {
        const recursiveValue = recursive && value === typeName
        if (recursiveValue || this.#hasTypeDeclaration(sourceFile, value)) {
          writer = writer.write(this.#formatRuntypeName(value))
          if (
            !recursiveValue &&
            !this.#exports.has(value) &&
            !this.#circularReferences.has(value)
          )
            this.#writeRuntype(
              sourceFile,
              value,
              sourceImports,
              exportStaticType
            )
          return true
        }
        return undefined
      })
      .handle(DeclareType, (typeName) => {
        runTypeType = typeName
      })
      .run()

    doInModule(this.#targetFile, runTypeName, (node, name) => {
      node.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name,
            initializer: writer.toString(),
            type: runTypeType,
          },
        ],
      })

      if (exportStaticType) {
        if (!staticImplementation) {
          this.#runtypesImports.add('Static')
          staticImplementation = `Static<typeof ${name}>`
        }

        node.addTypeAlias({
          isExported: true,
          name: typeName.split('.').reduceRight((x) => x),
          type: staticImplementation,
        })
      }
    })

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
    const importTypeDeclaration = this.#getImportedTypeDeclaration(
      sourceFile,
      typeName
    )

    if (importTypeDeclaration) return importTypeDeclaration

    const declaration = findInModule(
      sourceFile,
      typeName,
      (node, name) =>
        node.getInterface(name) ||
        node.getTypeAlias(name) ||
        node.getEnum(name) ||
        node.getFunction(name) ||
        node.getVariableDeclaration(name)
    )

    if (!declaration)
      throw new Error(
        `Cannot find any interface, type or enum called "${typeName}" in ${sourceFile.getFilePath()}.`
      )

    return declaration
  }

  #getImportedTypeDeclaration(sourceFile: SourceCodeFile, typeName: string) {
    const importInfo = find(
      sourceFile.getImportDeclarations(),
      (importDeclaration) => {
        let [remoteIdentifier, localIdentifier] =
          importDeclaration
            .getImportClause()
            ?.getDescendantsOfKind(SyntaxKind.Identifier)
            .map((indentifier) => indentifier.getText()) || []
        localIdentifier = localIdentifier || remoteIdentifier
        return (
          localIdentifier === typeName && {
            path: importDeclaration.getModuleSpecifierValue(),
            remoteIdentifier,
          }
        )
      }
    )

    if (!importInfo) return

    const importPath =
      isAbsolute(importInfo.path) || !importInfo.path.startsWith('.')
        ? importInfo.path
        : resolvePath(dirname(sourceFile.getFilePath()), importInfo.path)

    return this.#getTypeDeclaration(
      this.#project.addSourceFileAtPath(
        /\.(m|j)?ts$/.test(importPath) ? importPath : `${importPath}.ts`
      ),
      importInfo.remoteIdentifier
    )
  }

  /**
   * Sometimes a typeName can be in the format of:
   * `import("/some/path").A`
   * When this occurs, decipher the source file's local
   * alias of the imported type.
   */
  #getLocalName(sourceFile: SourceCodeFile, typeName: string) {
    const match = importTypeNameRegExp(typeName)
    if (!match) return typeName
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
      let [remoteIdentifier, localIdentifier] =
        importDeclaration
          .getImportClause()
          ?.getDescendantsOfKind(SyntaxKind.Identifier)
          .map((indentifier) => indentifier.getText()) || []
      localIdentifier = localIdentifier || remoteIdentifier
      if (remoteIdentifier === match.importTypeName) return localIdentifier
    }
    return match.importTypeName
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
      importPath: /\.(m|j)?ts$/.test(match[1]) ? match[1] : `${match[1]}`,
      importTypeName: match[2],
    }
  )
}

function isRecursive(typeDeclaration: ConsideredTypeDeclaration) {
  const name = typeDeclaration.getName()
  return !!name && findReferenceWithinDeclaration(name, typeDeclaration)
}

function findReferenceWithinDeclaration(
  name: string,
  typeDeclaration: ConsideredTypeDeclaration
) {
  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}

function isCircular(typeDeclaration: ConsideredTypeDeclaration) {
  const name = typeDeclaration.getName()
  if (!name) return false

  for (const originalReference of typeDeclaration.findReferences()) {
    for (const reference of originalReference.getReferences()) {
      const declarationNode = getNodeDeclaration(reference.getNode())
      if (declarationNode) {
        const declarationName = getNodeIdentifier(declarationNode)
        if (
          declarationName &&
          declarationName !== name &&
          findReferenceWithinDeclaration(
            name,
            declarationNode as ConsideredTypeDeclaration
          ) &&
          findReferenceWithinDeclaration(declarationName, typeDeclaration)
        ) {
          return true
        }
      }
    }
  }

  return false
}

function getNodeDeclaration(node: Node<ts.Node>) {
  return find(
    ConsideredTypeDeclarationSyntaxKinds,
    (syntaxKind) => node.getFirstAncestorByKind(syntaxKind) || false
  )
}

function getNodeIdentifier(node: Node<ts.Node>) {
  return node.getFirstDescendantByKind(SyntaxKind.Identifier)?.getText()
}

const ConsideredTypeDeclarationSyntaxKinds = [
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.EnumDeclaration,
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.VariableDeclaration,
]

type ConsideredTypeDeclaration =
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | VariableDeclaration
