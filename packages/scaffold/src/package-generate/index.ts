import Generator from 'yeoman-generator'
import { paramCase, pascalCase } from 'change-case'
import { validateGenerationFromRoot } from '../validation'
import * as path from 'path'
import prettier from 'prettier'
import { writeFile } from 'fs/promises'

export = class PackageGenerator extends Generator {
  #namespace = '@runtyping'
  #vsCodeWS = 'runtyping.code-workspace'
  #answers: {
    description?: string
    name?: string
    public?: boolean
    typewriter?: boolean
  } = {}

  constructor(args: string | string[], opts: Record<string, unknown>) {
    super(args, opts)
  }

  initializing() {
    validateGenerationFromRoot(this)
  }

  get #relativeDestinationRoot() {
    return `packages/${paramCase(this.#answers.name!)}`
  }

  async prompting() {
    this.#answers = await this.prompt([
      {
        message: `What is the packages's name? (Minus the ${
          this.#namespace
        } namespace)`,
        name: 'name',
        type: 'input',
        validate: (x) => !!x || 'You must supply a name',
      },
      {
        message: 'Is this package a type writer?',
        name: 'typewriter',
        type: 'confirm',
      },
      {
        message: 'Will this package be published publically?',
        name: 'public',
        type: 'confirm',
      },
    ])

    if (this.#answers.typewriter) {
      this.#answers.description = `Generate ${
        this.#answers.name
      } from static types & JSON schema.`
    } else
      this.#answers = {
        ...this.#answers,
        ...(await this.prompt([
          {
            message: "What's this package about?",
            name: 'description',
            type: 'input',
          },
        ])),
      }
  }

  configuring() {
    this.destinationRoot(this.#relativeDestinationRoot)
    this.sourceRoot(path.resolve(__dirname, '..', '..', 'templates'))
  }

  async writing() {
    const context = {
      description: this.#answers.description || '',
      name: paramCase(this.#answers.name!),
      fullName: `${this.#namespace}/${paramCase(this.#answers.name!)}`,
      typeWritersName: `${pascalCase(this.#answers.name!)}TypeWriters`,
      public: this.#answers.public,
      year: new Date().getFullYear(),
    }

    this.packageJson.set('name', context.fullName)
    this.packageJson.set('version', '0.0.0')
    this.packageJson.set('description', this.#answers.description)
    this.packageJson.set('main', 'dist/index.js')

    if (!this.#answers.public) {
      this.packageJson.set('private', true)
    }

    this.packageJson.set('scripts', {
      build: 'yarn clean && tsc',
      clean: 'rimraf dist',
      start: 'tsc --watch --preserveWatchOutput',
      test: 'jest',
    })

    this.packageJson.set('license', 'MIT')

    this.packageJson.set('bugs', {
      url: 'https://github.com/johngeorgewright/runtyping/issues',
    })

    this.packageJson.set(
      'homepage',
      'https://github.com/johngeorgewright/runtyping#readme'
    )

    const devDependencies = [
      '@runtyping/test-type-writers',
      '@types/jest',
      '@types/node',
      'jest',
      'rimraf',
      'ts-node',
      'ts-jest',
      'typescript',
    ]

    if (this.#answers.public) {
      devDependencies.push(
        '@semantic-release/commit-analyzer',
        '@semantic-release/git',
        '@semantic-release/github',
        '@semantic-release/npm',
        '@semantic-release/release-notes-generator',
        'semantic-release',
        'semantic-release-monorepo'
      )
    }

    const dependencies = ['tslib']

    if (this.#answers.typewriter) {
      this.packageJson.set('bin', {
        runtyping: 'dist/cli.js',
      })
      dependencies.push('@runtyping/generator', 'ts-morph')
    }

    await this.addDevDependencies(devDependencies)
    await this.addDependencies(dependencies)

    if (this.#answers.typewriter) {
      this.fs.copyTpl(
        this.templatePath('typewriter/tsconfig.json'),
        this.destinationPath('tsconfig.json'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/tsconfig.test.json'),
        this.destinationPath('tsconfig.test.json'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/jest.config.ts.template'),
        this.destinationPath('jest.config.ts'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/README.md'),
        this.destinationPath('README.md'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/src/index.ts.template'),
        this.destinationPath(`src/index.ts`),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/src/cli.ts.template'),
        this.destinationPath(`src/cli.ts`),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/src/TypeWriters.ts.template'),
        this.destinationPath(`src/${context.typeWritersName}.ts`),
        context
      )

      this.fs.copyTpl(
        this.templatePath('typewriter/test/typewriter.test.ts.template'),
        this.destinationPath(`test/typewriter.test.ts`),
        context
      )
    } else {
      this.fs.copy(
        this.templatePath('tsconfig.json'),
        this.destinationPath('tsconfig.json')
      )

      this.fs.copy(
        this.templatePath('tsconfig.test.json'),
        this.destinationPath('tsconfig.test.json')
      )

      this.fs.copy(
        this.templatePath('jest.config.ts.template'),
        this.destinationPath('jest.config.ts')
      )

      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('package-src/index.ts.template'),
        this.destinationPath('src/index.ts'),
        context
      )

      this.fs.copyTpl(
        this.templatePath('package-test/index.test.ts.template'),
        this.destinationPath('test/index.test.ts'),
        context
      )
    }

    this.fs.copyTpl(
      this.templatePath('LICENSE'),
      this.destinationPath('LICENSE'),
      context
    )

    await this.#updateVSCodeWS(this.#vsCodeWS)
  }

  async #updateVSCodeWS(file: string) {
    const vsCodeWS = JSON.parse(this.fs.read(file))

    vsCodeWS.folders.push({
      name: `📦 ${this.#namespace}/${this.#answers.name}`,
      path: this.#relativeDestinationRoot,
    })

    vsCodeWS.folders.sort((a: any, b: any) =>
      a.name === b.name ? 0 : a.name < b.name ? -1 : 0
    )

    const prettierOptions = (await prettier.resolveConfig(file)) || {}
    prettierOptions.parser = 'json'

    writeFile(file, prettier.format(JSON.stringify(vsCodeWS), prettierOptions))
  }

  async install() {
    this.spawnCommandSync('yarn', [])
  }
}
