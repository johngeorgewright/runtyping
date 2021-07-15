import {
  Project,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  VariableDeclarationKind,
  SourceFile,
} from 'ts-morph'
import { Instruction, InstructionSourceType } from './types'
import prettier from 'prettier'
import { readFile, writeFile } from 'fs/promises'
import generateType, { Import, Variable, Writer } from './generateType'

export default async function generate({
  buildInstructions,
  project,
}: {
  buildInstructions: Instruction[]
  project: Project
}) {
  // const diagnostics = project.getPreEmitDiagnostics()

  // const allTargetFiles = buildInstructions.map(
  //   (buildInstruction) => buildInstruction.targetFile
  // )

  // const filteredDiagnostics = diagnostics.filter(
  //   (diagnostic) =>
  //     !allTargetFiles.some((targetFile) =>
  //       diagnostic.getSourceFile()?.getFilePath().includes(targetFile)
  //     )
  // )

  // console.log(project.formatDiagnosticsWithColorAndContext(filteredDiagnostics))

  await Promise.all(
    buildInstructions.map(async (buildInstruction) => {
      const imports = new Set<string>()
      const targetFile = project.createSourceFile(
        buildInstruction.targetFile,
        '',
        { overwrite: true }
      )

      for (const sourceType of buildInstruction.sourceTypes) {
        generateRuntype(project, sourceType, targetFile, imports)
      }

      targetFile.addImportDeclaration({
        namedImports: [...imports],
        moduleSpecifier: 'runtypes',
      })

      await targetFile.save()
      await format(targetFile.getFilePath())

      console.log(`Generated ${buildInstruction.targetFile}`)
    })
  )

  console.log('All done!')
}

function generateRuntype(
  project: Project,
  sourceType: InstructionSourceType,
  targetFile: SourceFile,
  imports: Set<string>
) {
  const typeDeclaration = getTypeDeclaration(project, sourceType)
  let writer = project.createWriter()
  const generator = generateType(writer, typeDeclaration.getType())
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
        generateRuntype(
          project,
          {
            file: sourceType.file,
            type: item.value[1],
          },
          targetFile,
          imports
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

function getTypeDeclaration(
  project: Project,
  sourceType: InstructionSourceType
) {
  const sourceFile = project.addSourceFileAtPath(sourceType.file)
  let typeDeclaration: InterfaceDeclaration | TypeAliasDeclaration

  try {
    try {
      typeDeclaration = sourceFile.getInterfaceOrThrow(sourceType.type)
    } catch (error) {
      typeDeclaration = sourceFile.getTypeAliasOrThrow(sourceType.type)
    }
  } catch (error) {
    throw new Error(`No interface or type called ${sourceType.type}.`)
  }

  return typeDeclaration
}

async function format(fileName: string) {
  const config = (await prettier.resolveConfig(fileName)) || {}
  const contents = await readFile(fileName)
  await writeFile(
    fileName,
    prettier.format(contents.toString(), {
      ...config,
      filepath: fileName,
    })
  )
}
