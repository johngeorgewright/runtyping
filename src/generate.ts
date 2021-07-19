import {
  Project,
  SourceFile,
  IndentationText,
  NewLineKind,
  QuoteKind,
} from 'ts-morph'
import { Instruction, InstructionSourceType } from './types'
import writeRuntype from './writeRuntype'
import { compileFromFile } from 'json-schema-to-typescript'
import path, { extname } from 'path'
import { cast as castArray } from '@johngw/array'

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
    const runtypesImports = new Set<string>()
    const exports = new Set<string>()
    const targetFile = project.createSourceFile(
      buildInstruction.targetFile,
      '',
      { overwrite: true }
    )

    for (const sourceType of buildInstruction.sourceTypes) {
      const sourceImports = new Set<string>()

      switch (extname(sourceType.file)) {
        case '.json':
          await generateRuntypeFromJSON(
            project,
            sourceType,
            targetFile,
            runtypesImports,
            sourceImports,
            exports
          )
          break

        case '.d.ts':
        case '.ts':
          generateRuntype(
            project,
            sourceType,
            targetFile,
            runtypesImports,
            sourceImports,
            exports
          )
          break

        default:
          throw new Error(`${sourceType.file} is not a typescript or json file`)
      }

      if (sourceImports.size) {
        const sourceDir = path.dirname(sourceType.file)
        const targetDir = path.dirname(targetFile.getFilePath())
        const sourceBaseName = path.basename(
          sourceType.file,
          path.extname(sourceType.file)
        )
        const moduleSpecifier = `${
          path.relative(targetDir, sourceDir) || '.'
        }/${sourceBaseName}`
        targetFile.addImportDeclaration({
          namedImports: [...sourceImports],
          moduleSpecifier,
        })
      }
    }

    targetFile.addImportDeclaration({
      namedImports: [...runtypesImports],
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
  runtypesImports: Set<string>,
  sourceImports: Set<string>,
  exports: Set<string>
) {
  const schema = await compileFromFile(sourceType.file)
  const sourceFile = project.createSourceFile(
    `__temp__${sourceType.file}.ts`,
    schema
  )
  generateRuntype(
    project,
    { file: sourceFile.getFilePath(), type: sourceType.type },
    targetFile,
    runtypesImports,
    sourceImports,
    exports
  )
  project.removeSourceFile(sourceFile)
}

function generateRuntype(
  project: Project,
  sourceType: InstructionSourceType,
  targetFile: SourceFile,
  runtypesImports: Set<string>,
  sourceImports: Set<string>,
  exports: Set<string>
) {
  const sourceFile = project.addSourceFileAtPath(sourceType.file)

  for (const type of castArray(sourceType.type)) {
    writeRuntype(
      project,
      sourceFile,
      type,
      targetFile,
      runtypesImports,
      sourceImports,
      exports
    )
  }
}
