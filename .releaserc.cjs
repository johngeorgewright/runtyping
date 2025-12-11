// @ts-check

/**
 * @type {import('semantic-release').Options}
 */
const config = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
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
