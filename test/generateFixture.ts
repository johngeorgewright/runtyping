import * as pathHelper from 'path'
import { Project } from 'ts-morph'
import generate from '../src/generate'

export default function generateFixture(name: string, types: string[]) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  })

  const [file] = generate({
    buildInstructions: [
      {
        targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
        sourceTypes: types.map((type) => ({
          file: pathHelper.join(__dirname, `${name}.ts`),
          type,
        })),
      },
    ],
    project,
  })

  return file
}
