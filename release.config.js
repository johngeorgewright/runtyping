// @ts-check

/**
 * @type {import('semantic-release').Options}
 */
const config = {
  branches: ['master'],
  extends: ['semantic-release-monorepo'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        verifyConditionsCmd: 'yarn npm whoami --publish',
        prepareCmd:
          "yarn version ${nextRelease.version} && echo '::set-output name=version::${nextRelease.version}'",
        publishCmd: 'yarn npm publish',
      },
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
}

module.exports = config
