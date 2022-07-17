import * as pathHelper from 'path'
import { readdir, writeFile } from 'fs/promises'
import Generator from 'yeoman-generator'
import { validateGenerationFromRoot } from '../validation'
import prettier from 'prettier'
import rimrafCB from 'rimraf'
import { promisify } from 'util'

const rimraf = promisify(rimrafCB)

export = class RemovePackageGenerator extends Generator {
  #vsCodeWS = 'runtyping.code-workspace'
  #packagesPath = pathHelper.resolve(__dirname, '..', '..', '..')
  #answers: { names?: string[] } = {}

  initializing() {
    validateGenerationFromRoot(this)
  }

  async prompting() {
    this.#answers = await this.prompt({
      message: `Which packages do you want to delete?`,
      name: 'names',
      type: 'checkbox',
      choices: await this.#getPackages(),
    })

    if (!this.#answers.names?.length) {
      this.startOver()
    }
  }

  async #getPackages() {
    return (await readdir(this.#packagesPath, { withFileTypes: true })).filter(
      (entry) => entry.isDirectory() && entry.name !== 'generator'
    )
  }

  async writing() {
    for (const name of this.#answers.names!) {
      await rimraf(`${this.#packagesPath}/${name}`)
    }

    await this.#updateVSCodeWS(this.#vsCodeWS)
  }

  async #updateVSCodeWS(file: string) {
    const vsCodeWS = JSON.parse(this.fs.read(file))

    vsCodeWS.folders = vsCodeWS.folders.filter(
      (folder: any) =>
        !this.#answers.names?.find((name) => folder.name.endsWith(`/${name}`))
    )

    const prettierOptions = (await prettier.resolveConfig(file)) || {}
    prettierOptions.parser = 'json'

    writeFile(file, prettier.format(JSON.stringify(vsCodeWS), prettierOptions))
  }

  async install() {
    this.spawnCommandSync('yarn', [])
  }
}
