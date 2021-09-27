#!/usr/bin/env node

import { cast as castArray } from '@johngw/array'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import yaml from 'js-yaml'
import yargs from 'yargs/yargs'
import Generator from './Generator'
import { Instructions } from './runtypes'

if (process.argv[1] === 'rungen') {
  console.warn(
    'DEPRECATED: Use the `runtyping` bin command instead of `rungen`.'
  )
}

const argv = yargs(process.argv.slice(2))
  .option('config', {
    alias: 'c',
    describe: 'The path to the generator config file.',
    type: 'string',
  })
  .option('project', {
    alias: 'p',
    default: 'tsconfig.json',
    describe: 'The typescript project file.',
    type: 'string',
  }).argv

;(async () => {
  const configFile = await getConfigFile(argv.config)
  const buildInstructions = Instructions.check(
    yaml.load(await readFile(configFile, 'utf8'))
  )

  for (const { targetFile, sourceTypes } of castArray(buildInstructions)) {
    const generator = new Generator({
      targetFile,
      tsConfigFile: argv.project,
    })
    const file = await generator.generate(sourceTypes)
    await file.save()
    console.info(`Generated ${file.getFilePath()}`)
  }
})().catch((error) => {
  console.error(error)
})

async function getConfigFile(path?: string) {
  if (!path) {
    try {
      await access('runtypes.gen.yml', constants.F_OK)
      path = 'runtypes.gen.yml'
      console.warn('DEPRECATED: Please move runtypes.gen.yml to runtyping.yml')
    } catch (e) {
      path = 'runtyping.yml'
    }
  }

  try {
    await access(path, constants.R_OK)
  } catch (error) {
    throw new Error(`Cannot read config file "${path}"`)
  }

  return path
}
