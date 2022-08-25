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
  Type,
  TypeAliasDeclaration,
  TypeParameterDeclarationStructure,
  VariableDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { InstructionSourceType } from './runtypes'
import {
  CanDeclareStatics,
  DeclareAndUse,
  DeclareType,
  Import,
  ImportFromSource,
  Static,
  StaticParameters,
  TypeWriter,
  Write,
} from './TypeWriter'
import TypeWriters from './TypeWriters'
import typeNameFormatter, { TypeNameFormatter } from './typeNameFormatter'
import {
  doInModule,
  find,
  findInModule,
  getRelativeImportPath,
  isRelative,
} from './util'
import { groupBy } from 'lodash'

type GeneratorOptionsBase =
  | {
      tsConfigFile?: string
    }
  | {
      project?: Project
    }

export type GeneratorOptions = GeneratorOptionsBase & {
  runtypeFormat?: string
  targetFile: string
  typeFormat?: string
  typeWriters: TypeWriters
}

type SourceCodeFile = SourceFile

export type ImportSpec = Omit<ImportSpecifierStructure, 'kind'> & {
  source: string
}

export default class Generator {
  #circularReferences = new Set<string>()
  #exports = new Set<string>()
  #typeWriters: TypeWriters
  #formatRuntypeName: TypeNameFormatter
  #formatTypeName: TypeNameFormatter
  #project: Project
  #imports: ImportSpec[] = []
  #targetFile: SourceCodeFile

  constructor(options: GeneratorOptions) {
    this.#typeWriters = options.typeWriters

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
      switch (extname(sourceType.file)) {
        case '.json':
          await this.#generateRuntypeFromJSON(sourceType)
          break

        case '.d.ts':
        case '.ts':
          this.#generateRuntype(sourceType)
          break

        default:
          throw new Error(`${sourceType.file} is not a typescript or json file`)
      }
    }

    if (this.#imports.length) this.#addImports(this.#imports)

    this.#targetFile.formatText()
    return this.#targetFile
  }

  #addImports(imports: ImportSpec[]) {
    const sourceImportMap = groupBy(imports, 'source')
    for (const [sourceFilePath, imports] of Object.entries(sourceImportMap))
      this.#targetFile.addImportDeclaration({
        namedImports: imports.sort(({ name: nameA }, { name: nameB }) =>
          nameA.localeCompare(nameB)
        ),
        moduleSpecifier: sourceFilePath,
      })
  }

  async #generateRuntypeFromJSON(sourceType: InstructionSourceType) {
    const schema = await compileFromFile(sourceType.file)
    const sourceFile = this.#project.createSourceFile(
      `__temp__${sourceType.file}.ts`,
      schema
    )
    this.#generateRuntype({
      ...sourceType,
      file: sourceFile.getFilePath(),
    })
    this.#project.removeSourceFile(sourceFile)
  }

  #generateRuntype(sourceType: InstructionSourceType) {
    const sourceFile = this.#project.addSourceFileAtPath(
      isAbsolute(sourceType.file) || isRelative(sourceType.file)
        ? sourceType.file
        : require.resolve(sourceType.file)
    )
    for (const type of castArray(sourceType.type))
      if (!this.#exports.has(type))
        this.#writeRuntype(sourceFile, type, sourceType)
  }

  #writeRuntype(
    sourceFile: SourceCodeFile,
    sourceType: string,
    instructionSourceType: InstructionSourceType
  ) {
    const sourceTypeLocalName = this.#getLocalName(sourceFile, sourceType)
    const runTypeName = this.#formatRuntypeName(sourceTypeLocalName)
    const typeName = this.#formatTypeName(sourceTypeLocalName)
    const typeDeclaration = this.#getTypeDeclaration(sourceFile, sourceType)
    const recursive = isRecursive(typeDeclaration)
    const circular = isCircular(typeDeclaration)
    const exportStaticType =
      instructionSourceType.exportStaticType === undefined
        ? true
        : instructionSourceType.exportStaticType

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

    const canDeclareStatics = (type: Type) =>
      exportStaticType && type.getText() === typeDeclaration.getType().getText()

    const runTypeWriter = (typeWriter: TypeWriter) => {
      IteratorHandler.create(typeWriter)
        .handle(CanDeclareStatics, canDeclareStatics)
        .handle(Write, (value) => {
          writer = writer.write(value)
        })
        .handle(Import, this.#import)
        .handle(ImportFromSource, (importSpec) => {
          this.#importFromSource(instructionSourceType.file, importSpec)
        })
        .handle(Static, ([type, value]) => {
          if (canDeclareStatics(type)) staticImplementation = value
        })
        .handle(StaticParameters, ([type, value]) => {
          if (canDeclareStatics(type)) staticTypeParameters = value
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
              this.#writeRuntype(sourceFile, value, instructionSourceType)
            return true
          }
          return undefined
        })
        .handle(DeclareType, (typeName) => {
          runTypeType = typeName
        })
        .run()
    }

    runTypeWriter(
      this.#typeWriters.typeWriter(typeDeclaration.getType(), {
        circular: !!circular,
        recursive,
      })
    )

    if (exportStaticType && !staticImplementation)
      runTypeWriter(
        this.#typeWriters.defaultStaticImplementation(typeDeclaration.getType())
      )

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

  readonly #import = (importSpec: ImportSpec) => {
    const hasImport = this.#imports.find(
      ({ alias, name, source }) =>
        source === importSpec.source &&
        ('alias' in importSpec
          ? alias === importSpec.alias
          : name === importSpec.name)
    )

    if (!hasImport) this.#imports.push(importSpec)
  }

  #importFromSource(
    sourceFilePath: string,
    importSpec: Omit<ImportSpec, 'source'>
  ) {
    this.#import({
      ...importSpec,
      source: getRelativeImportPath(
        this.#targetFile.getFilePath(),
        sourceFilePath
      ),
    })
  }

  #isConsideredType(node: Node): node is ConsideredTypeDeclaration {
    return ConsideredTypeDeclarationSyntaxKinds.some((kind) =>
      node.isKind(kind)
    )
  }

  /**
   * Will get default export if typeName is not specified
   */
  #getTypeDeclaration(
    sourceFile: SourceCodeFile,
    typeName?: string
  ): ConsideredTypeDeclaration {
    if (!typeName) {
      const declaration = sourceFile
        .getDefaultExportSymbolOrThrow()
        .getValueDeclarationOrThrow()
      if (!this.#isConsideredType(declaration))
        throw new Error(
          `Default export of ${sourceFile.getFilePath()} is an interface, type or enum`
        )
      return declaration
    }

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
        const defaultImportName = importDeclaration
          .getDefaultImport()
          ?.getText()

        const importSpecifier =
          defaultImportName === typeName
            ? {
                localIdentifier: defaultImportName,
                remoteIdentifier: undefined,
              }
            : find(
                importDeclaration.getImportClause()?.getNamedImports() || [],
                (importSpecifier) => {
                  let [remoteIdentifier, localIdentifier] = importSpecifier
                    .getDescendantsOfKind(SyntaxKind.Identifier)
                    .map((indentifier) => indentifier.getText())
                  localIdentifier = localIdentifier || remoteIdentifier
                  return (
                    localIdentifier === typeName && {
                      remoteIdentifier,
                      localIdentifier,
                    }
                  )
                }
              )

        return (
          importSpecifier?.localIdentifier === typeName && {
            path: importDeclaration.getModuleSpecifierValue(),
            remoteIdentifier: importSpecifier.remoteIdentifier,
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
      if (match.importTypeName === 'default')
        return importDeclaration.getDefaultImportOrThrow().getText()
      else {
        for (const importSpecifier of importDeclaration
          .getImportClause()
          ?.getNamedImports() || []) {
          let [remoteIdentifier, localIdentifier] = importSpecifier
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .map((indentifier) => indentifier.getText())
          localIdentifier = localIdentifier || remoteIdentifier
          if (remoteIdentifier === match.importTypeName) return localIdentifier
        }
      }
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
