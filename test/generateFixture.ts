import * as pathHelper from 'path'
import Generator from '../src/Generator'

export default async function generateFixture(name: string, types: string[]) {
  const generator = new Generator({
    targetFile: pathHelper.join(__dirname, `${name}.runtypes.ts`),
  })

  return generator.generate([
    {
      file: pathHelper.join(__dirname, `${name}.ts`),
      type: types,
    },
  ])
}
