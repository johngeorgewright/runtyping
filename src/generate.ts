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
import { tryCatch } from '@johngw/error'
import RuntypeGenerator, { Import, Variable, Writer } from './RuntypeGenerator'

export default async function generate({
  buildInstructions,
  project,
}: {
  buildInstructions: Instruction[]
  project: Project
}) {
  await Promise.all(
    buildInstructions.map(async (buildInstruction) => {
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
  return tryCatch<InterfaceDeclaration | TypeAliasDeclaration, []>(
    () => sourceFile.getInterfaceOrThrow(sourceType),
    () =>
      tryCatch(
        () => sourceFile.getTypeAliasOrThrow(sourceType),
        () => {
          throw new Error(`No interface or type called ${sourceType}.`)
        }
      )
  )
}

function hasTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  return tryCatch(
    () => !!sourceFile.getInterfaceOrThrow(sourceType),
    () =>
      tryCatch(
        () => !!sourceFile.getTypeAliasOrThrow(sourceType),
        () => false
      )
  )
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
