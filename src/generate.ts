import { Project, VariableDeclarationKind, SourceFile } from 'ts-morph'
import { Instruction, InstructionSourceType } from './types'
import RuntypeGenerator, { Import, Variable, Writer } from './RuntypeGenerator'

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
  let writer = project.createWriter()
  const generator = RuntypeGenerator.generateType(
    writer,
    typeDeclaration.getType(),
    (type) => hasTypeDeclaration(sourceFile, type)
  )
  let item = generator.next(writer)

  while (!item.done) {
    switch (item.value[0]) {
      case Writer:
        writer = item.value[1]
        break
      case Import:
        imports.add(item.value[1])
        break
      case Variable:
        if (!exports.has(item.value[1]))
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

    item = generator.next(writer)
  }

  targetFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: sourceType.type,
        initializer: item.value.toString(),
      },
    ],
  })

  imports.add('Static')

  targetFile.addTypeAlias({
    isExported: true,
    name: sourceType.type,
    type: `Static<typeof ${sourceType.type}>`,
  })
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
    throw new Error(`No interface, type or enum called ${sourceType}.`)
  }
}

function hasTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return !!getTypeDeclaration(sourceFile, sourceType)
  } catch (error) {
    return false
  }
}
