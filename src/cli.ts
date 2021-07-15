#!/usr/bin/env node

import { readFile } from 'fs/promises'
import yaml from 'js-yaml'
import { IndentationText, NewLineKind, Project, QuoteKind } from 'ts-morph'
import yargs from 'yargs/yargs'
import generate from './generate'
// import { Instructions } from './runtypes'

const argv = yargs(process.argv.slice(2))
  .option('config', {
    alias: 'c',
    default: 'runtypes.gen.yml',
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
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      newLineKind: NewLineKind.LineFeed,
      quoteKind: QuoteKind.Single,
      usePrefixAndSuffixTextForRename: false,
      useTrailingCommas: true,
    },
    skipAddingFilesFromTsConfig: true,
    tsConfigFilePath: argv.project,
  })

  let buildInstructions: ReturnType<typeof yaml.load>

  try {
    buildInstructions = yaml.load(await readFile(argv.config, 'utf8'))
  } catch (error) {
    console.log(error)
  }

  await generate({
    buildInstructions: buildInstructions as any,
    project,
  })
})().catch((error) => {
  console.error(error)
})
