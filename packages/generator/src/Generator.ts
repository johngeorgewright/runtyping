import { cast as castArray } from '@johngw/array'
import { IteratorHandler } from '@johngw/iterator'
import { compileFromFile } from 'json-schema-to-typescript'
import { dirname, extname, isAbsolute, resolve as resolvePath } from 'path'
import {
  EnumDeclaration,
  FunctionDeclaration,
  ImportSpecifierStructure,
  IndentationText,
  InterfaceDeclaration,
  NewLineKind,
  Node,
  OptionalKind,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind,
  ts,
  TypeAliasDeclaration,
  TypeParameterDeclarationStructure,
  VariableDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { InstructionSourceType } from './runtypes'
import {
  DeclareAndUse,
  DeclareType,
  Import,
  ImportFromSource,
  Static,
  StaticParameters,
  Write,
} from './TypeWriter'
import TypeWriters from './TypeWriters'
import typeNameFormatter, { TypeNameFormatter } from './typeNameFormatter'
import {
  doInModule,
  find,
  findInModule,
  getRelativeImportPath,
  setHas,
} from './util'

type GeneratorOptionsBase =
  | {
      factory: TypeWriters
      module: string
      targetFile: string
      tsConfigFile?: string
    }
  | {
      factory: TypeWriters
      module: string
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
  #factory: TypeWriters
  #formatRuntypeName: TypeNameFormatter
  #formatTypeName: TypeNameFormatter
  #module: string
  #project: Project
  #imports = new Set<string | OptionalKind<ImportSpecifierStructure>>()
  #targetFile: SourceCodeFile

  constructor(options: GeneratorOptions) {
    this.#factory = options.factory
    this.#module = options.module

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
      namedImports: [...this.#imports],
      moduleSpecifier: this.#module,
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
  ) {
    const sourceTypeLocalName = this.#getLocalName(sourceFile, sourceType)
    const runTypeName = this.#formatRuntypeName(sourceTypeLocalName)
    const typeName = this.#formatTypeName(sourceTypeLocalName)
    const typeDeclaration = this.#getTypeDeclaration(sourceFile, sourceType)
    const recursive = isRecursive(typeDeclaration)
    const circular = isCircular(typeDeclaration)

    let staticImplementation: string | undefined
    let staticTypeParameters:
      | (string | OptionalKind<TypeParameterDeclarationStructure>)[]
      | undefined
    let writer = this.#project.createWriter()
    let runTypeType: string | undefined

    if (circular) {
      this.#circularReferences.add(typeName)
      console.warn(
        `Spotted a circular reference between \`${circular.join(
          '` and `'
        )}\`. This may cause infinite loops at runtime.`
      )
    }

    IteratorHandler.create(
      this.#factory.typeWriter(typeDeclaration.getType(), {
        circular: !!circular,
        recursive,
      })
    )
      .handle(Write, (value) => {
        writer = writer.write(value)
      })
      .handle(Import, this.#import)
      .handle(ImportFromSource, ({ name, alias }) => {
        sourceImports.set(name, alias)
      })
      .handle(Static, (value) => {
        staticImplementation = value
      })
      .handle(StaticParameters, (value) => {
        staticTypeParameters = value
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

      if (exportStaticType && staticImplementation)
        node.addTypeAlias({
          isExported: true,
          name: typeName.split('.').reduceRight((x) => x),
          type: staticImplementation.replace('${name}', name),
          typeParameters: staticTypeParameters,
        })
    })

    this.#exports.add(sourceType)

    return {
      runTypeName,
      typeName,
    }
  }

  readonly #import = (
    value: string | OptionalKind<ImportSpecifierStructure>
  ) => {
    if (
      typeof value === 'object' &&
      setHas(this.#imports, (imprt) =>
        typeof imprt === 'object'
          ? imprt.name === value.name
          : imprt === value.name
      )
    )
      return
    this.#imports.add(value)
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
          return [declarationName, name]
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
