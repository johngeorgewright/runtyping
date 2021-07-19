import {
  Project,
  VariableDeclarationKind,
  SourceFile,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  SyntaxKind,
  IndentationText,
  NewLineKind,
  QuoteKind,
} from 'ts-morph'
import { Instruction, InstructionSourceType } from './types'
import runtypeGenerator, { Declare, Import, Write } from './runtypeGenerator'
import { compileFromFile } from 'json-schema-to-typescript'
import { extname } from 'path'

export default async function* generate(
  options:
    | {
        buildInstructions: Instruction[]
        tsConfigFile?: string
      }
    | {
        buildInstructions: Instruction[]
        project?: Project
      }
) {
  const project =
    'project' in options && options.project
      ? options.project
      : new Project({
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

  for (const buildInstruction of options.buildInstructions) {
    const imports = new Set<string>()
    const exports = new Set<string>()
    const targetFile = project.createSourceFile(
      buildInstruction.targetFile,
      '',
      { overwrite: true }
    )

    for (const sourceType of buildInstruction.sourceTypes) {
      switch (extname(sourceType.file)) {
        case '.json':
          await generateRuntypeFromJSON(
            project,
            sourceType,
            targetFile,
            imports,
            exports
          )
          break

        case '.d.ts':
        case '.ts':
          generateRuntype(project, sourceType, targetFile, imports, exports)
          break

        default:
          throw new Error(`${sourceType.file} is not a typescript or json file`)
      }
    }

    targetFile.addImportDeclaration({
      namedImports: [...imports],
      moduleSpecifier: 'runtypes',
    })

    targetFile.formatText()
    yield targetFile
  }
}

async function generateRuntypeFromJSON(
  project: Project,
  sourceType: InstructionSourceType,
  targetFile: SourceFile,
  imports: Set<string>,
  exports: Set<string>
) {
  const schema = await compileFromFile(sourceType.file)
  const sourceFile = project.createSourceFile('__temp.ts', schema)
  generateRuntype(
    project,
    { file: sourceFile.getFilePath(), type: sourceType.type },
    targetFile,
    imports,
    exports
  )
}

function generateRuntype(
  project: Project,
  sourceType: InstructionSourceType,
  targetFile: SourceFile,
  imports: Set<string>,
  exports: Set<string>
) {
  const sourceFile = project.addSourceFileAtPath(sourceType.file)
  const typeDeclaration = getTypeDeclaration(sourceFile, sourceType.type)
  const recursive = isRecursive(typeDeclaration)
  const generator = runtypeGenerator(typeDeclaration.getType(), recursive)

  let writer = project.createWriter()
  let item = generator.next()

  while (!item.done) {
    let next: true | undefined

    switch (item.value[0]) {
      case Write:
        writer = writer.write(item.value[1])
        break

      case Import:
        imports.add(item.value[1])
        break

      case Declare:
        if (recursive || hasTypeDeclaration(sourceFile, item.value[1])) {
          next = true
          writer = writer.write(item.value[1])
        }
        if (next && !recursive && !exports.has(item.value[1]))
          generateRuntype(
            project,
            {
              file: sourceType.file,
              type: item.value[1],
            },
            targetFile,
            imports,
            exports
          )
        break
    }

    item = generator.next(next)
  }

  targetFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: sourceType.type,
        initializer: writer.toString(),
      },
    ],
  })

  imports.add('Static')

  targetFile.addTypeAlias({
    isExported: true,
    name: sourceType.type,
    type: `Static<typeof ${sourceType.type}>`,
  })

  exports.add(sourceType.type)
}

function getTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return sourceFile.getInterfaceOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getTypeAliasOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getEnumOrThrow(sourceType)
  } catch (error) {
    throw new Error(
      `Cannot find any interface, type or enum called "${sourceType}" in ${sourceFile.getFilePath()}.`
    )
  }
}

function hasTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return !!getTypeDeclaration(sourceFile, sourceType)
  } catch (error) {
    return false
  }
}

function isRecursive(
  typeDeclaration: InterfaceDeclaration | TypeAliasDeclaration | EnumDeclaration
) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}
