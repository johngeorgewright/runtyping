import { cast as castArray } from '@johngw/array'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import yaml from 'js-yaml'
import yargs from 'yargs/yargs'
import Generator from './Generator'
import { Instructions } from './runtypes'
import TypeWriters from './TypeWriters'

export default async function cli(
  defaultConfigPath: string,
  typeWriters: TypeWriters
) {
  const argv = await yargs(process.argv.slice(2))
    .option('config', {
      alias: 'c',
      default: defaultConfigPath,
      describe: 'The path to the generator config file.',
      type: 'string',
    })
    .option('project', {
      alias: 'p',
      default: 'tsconfig.json',
      describe: 'The typescript project file.',
      type: 'string',
    }).argv

  const configFile = await getConfigFile(argv.config)
  const buildInstructions = Instructions.parse(
    yaml.load(await readFile(configFile, 'utf8'))
  )

  for (const {
    targetFile,
    sourceTypes,
    runtypeFormat,
    transformers,
    typeFormat,
  } of castArray(buildInstructions)) {
    const generator = new Generator({
      typeWriters,
      runtypeFormat,
      targetFile,
      tsConfigFile: argv.project,
      transformers: transformers || {},
      typeFormat,
    })
    const file = await generator.generate(sourceTypes)
    await file.save()
    console.info(`Generated ${file.getFilePath()}`)
  }
}

async function getConfigFile(path: string) {
  try {
    await access(path, constants.R_OK)
  } catch (error) {
    throw new Error(`Cannot read config file "${path}"`)
  }
  return path
}
