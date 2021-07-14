import {
  Project,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { Instruction } from './types'
import renderType from './renderType'
import prettier from 'prettier'
import { readFile, writeFile } from 'fs/promises'

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

      buildInstruction.sourceTypes.forEach((sourceType) => {
        let typeDeclaration: InterfaceDeclaration | TypeAliasDeclaration
        const sourceFile = project.addSourceFileAtPath(sourceType.file)

        try {
          try {
            typeDeclaration = sourceFile.getInterfaceOrThrow(sourceType.type)
          } catch (error) {
            typeDeclaration = sourceFile.getTypeAliasOrThrow(sourceType.type)
          }
        } catch (error) {
          throw new Error(`No interface or type called ${sourceType.type}.`)
        }

        targetFile.addVariableStatement({
          isExported: true,
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: sourceType.type,
              initializer: (writer) =>
                renderType(writer, typeDeclaration.getType(), imports),
            },
          ],
        })

        imports.add('Static')

        targetFile.addTypeAlias({
          isExported: true,
          name: sourceType.type,
          type: `Static<typeof ${sourceType.type}>`,
        })
      })

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
