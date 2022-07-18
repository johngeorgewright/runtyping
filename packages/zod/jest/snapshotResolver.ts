export default {
  resolveSnapshotPath(testPath: string, snapshotExtension: string) {
    return testPath.replace('generator/', 'zod/') + snapshotExtension
  },

  resolveTestPath(snapshotFilePath: string, snapshotExtension: string) {
    return snapshotFilePath
      .replace('zod/', 'generator/')
      .slice(0, -snapshotExtension.length)
  },

  testPathForConsistencyCheck: 'generator/test/example.test.ts',
}
