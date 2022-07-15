import * as pathHelper from 'path'
import Generator from 'yeoman-generator'

export function validateGenerationFromRoot(generator: Generator) {
  const path = pathHelper.join(process.cwd(), 'packages', 'scaffold')
  if (path !== pathHelper.resolve(__dirname, '..')) {
    generator.log(
      'You can only run this script from the root of the mono repo.'
    )
    process.exit(1)
  }
}
