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
          "yarn version ${nextRelease.version} && echo 'version=${nextRelease.version}' >> $GITHUB_OUTPUT",
        publishCmd: 'yarn npm publish --access public',
      },
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: 'runtyping.schema.json',
      },
    ],
  ],
}

module.exports = config
