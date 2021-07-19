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
import { extname } from 'path'
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
  const sourceFile = project.createSourceFile(
    `__temp__${sourceType.file}.ts`,
    schema
  )
  generateRuntype(
    project,
    { file: sourceFile.getFilePath(), type: sourceType.type },
    targetFile,
    imports,
    exports
  )
  project.removeSourceFile(sourceFile)
}

function generateRuntype(
  project: Project,
  sourceType: InstructionSourceType,
  targetFile: SourceFile,
  imports: Set<string>,
  exports: Set<string>
) {
  const sourceFile = project.addSourceFileAtPath(sourceType.file)

  for (const type of castArray(sourceType.type)) {
    writeRuntype(project, sourceFile, type, targetFile, imports, exports)
  }
}
