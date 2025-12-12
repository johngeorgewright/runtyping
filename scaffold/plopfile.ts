import { type NodePlopAPI } from 'plop'

export default async function scaffold(plop: NodePlopAPI) {
  plop.setActionType('jsonPatch', async (_answers, config) => {
    try {
      const { default: jsonPatch } = await import('fast-json-patch')
      const { readFile, writeFile } = await import('node:fs/promises')
      if (!config.path || !config.patch)
        throw new Error('Missing `path` or `patch` config params')
      const doc = JSON.parse(await readFile(config.path, 'utf-8'))
      const { newDocument } = jsonPatch.applyPatch(doc, config.patch)
      await writeFile(config.path, JSON.stringify(newDocument, null, 2))
      return `${config.path} patched`
    } catch (error: any) {
      return error.message
    }
  })

  plop.setActionType('exec', async (_answers, config) => {
    try {
      const { exec } = await import('node:child_process')
      return await new Promise((resolve, reject) => {
        exec(config.cmd, (error, stdout) => {
          if (error) reject(error)
          else resolve(stdout)
        })
      })
    } catch (error: any) {
      return error.message
    }
  })

  plop.setGenerator('package:add', {
    description: 'a new package',
    prompts: [
      {
        type: 'input',
        name: 'lib',
        message: 'What library will you be converting?',
      },
    ],
    actions: (answers) => [
      {
        type: 'addMany',
        destination: `../packages/${answers!.lib}`,
        base: 'package/',
        templateFiles: 'package/**/*',
        globOptions: { dot: true },
        data: {
          year: new Date().getFullYear(),
        },
      },
      {
        type: 'jsonPatch',
        // @ts-ignore untyped custom config
        path: 'runtyping.code-workspace',
        patch: [
          {
            op: 'add',
            path: '/folders/-',
            value: {
              name: `📦 @runtyping/${answers!.lib}`,
              path: `packages/${answers!.lib}`,
            },
          },
        ],
      },
      {
        type: 'jsonPatch',
        path: 'release-please-config.json',
        patch: [
          {
            op: 'add',
            path: `/packages/packages~1${answers!.lib}`,
            value: {
              'release-type': 'node',
              'package-name': answers!.lib,
              component: answers!.lib,
            },
          },
        ],
      },
      {
        type: 'jsonPatch',
        path: '.release-please-manifest.json',
        patch: [
          {
            op: 'add',
            path: `/packages~1${answers!.lib}`,
            value: '0.0.0',
          },
        ],
      },
      {
        type: 'exec',
        cmd: 'yarn',
      },
    ],
  })

  plop.setGenerator('package:remove', {
    description: 'remove a package',
    prompts: [
      {
        name: 'packages',
        type: 'checkbox',
        choices: async () => {
          const { readdir, readFile } = await import('node:fs/promises')
          const dirs = await readdir('packages')
          const codeWorkspaceJSON = JSON.parse(
            await readFile('runtyping.code-workspace', 'utf-8'),
          )
          return dirs
            .filter((name) => name !== '.' && name !== '..')
            .map((name) => ({
              name,
              value: {
                name,
                codeWorkspaceIndex: codeWorkspaceJSON.folders.findIndex(
                  (folder: { name: string }) =>
                    folder.name === `@runtyping/${name}`,
                ),
              },
            }))
        },
      },
    ],
    actions: (answers) => [
      ...answers!.packages.flatMap(
        ({
          name,
          codeWorkspaceIndex,
        }: {
          name: string
          codeWorkspaceIndex: number
        }) => [
          {
            type: 'exec',
            cmd: `rm -rf packages/${name}`,
          },
          {
            type: 'jsonPatch',
            path: 'runtyping.code-workspace',
            patch: [
              {
                op: 'remove',
                path: `/folders/${codeWorkspaceIndex}`,
              },
            ],
          },
          {
            type: 'jsonPatch',
            path: 'release-please-config.json',
            patch: [
              {
                op: 'remove',
                path: `/packages/packages~1${name}`,
              },
            ],
          },
          {
            type: 'jsonPatch',
            path: '.release-please-manifest.json',
            patch: [
              {
                op: 'remove',
                path: `/packages~1${name}`,
              },
            ],
          },
        ],
      ),
      {
        type: 'exec',
        cmd: 'yarn',
      },
    ],
  })
}
