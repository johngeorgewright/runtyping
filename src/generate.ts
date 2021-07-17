import {
  Project,
  VariableDeclarationKind,
  SourceFile,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  SyntaxKind,
} from 'ts-morph'
import { Instruction, InstructionSourceType } from './types'
import RuntypeGenerator, { Declare, Import, Write } from './RuntypeGenerator'
import runtypeGenerator from './RuntypeGenerator'

export default function* generate({
  buildInstructions,
  project,
}: {
  buildInstructions: Instruction[]
  project: Project
}) {
  for (const buildInstruction of buildInstructions) {
    const imports = new Set<string>()
    const exports = new Set<string>()
    const targetFile = project.createSourceFile(
      buildInstruction.targetFile,
      '',
      { overwrite: true }
    )

    for (const sourceType of buildInstruction.sourceTypes) {
      generateRuntype(project, sourceType, targetFile, imports, exports)
    }

    targetFile.addImportDeclaration({
      namedImports: [...imports],
      moduleSpecifier: 'runtypes',
    })

    targetFile.formatText()
    yield targetFile
  }
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
