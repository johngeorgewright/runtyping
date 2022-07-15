export default {
  resolveSnapshotPath(testPath: string, snapshotExtension: string) {
    return testPath.replace('generator/', 'runtypes/') + snapshotExtension
  },

  resolveTestPath(snapshotFilePath: string, snapshotExtension: string) {
    return snapshotFilePath
      .replace('runtypes/', 'generator/')
      .slice(0, -snapshotExtension.length)
  },

  testPathForConsistencyCheck: 'generator/test/example.test.ts',
}
