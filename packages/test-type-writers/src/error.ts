export class ExpectedFailure extends Error {
  constructor(
    public readonly testName: string,
    public readonly type: string,
    public readonly data: unknown
  ) {
    super(
      `Expected failure for ${testName}.${type}
Input: ${JSON.stringify(data, null, 2)}`
    )
  }
}

export class ExpectedSuccess extends Error {
  constructor(
    public readonly testName: string,
    public readonly type: string,
    public readonly data: unknown,
    error: Error
  ) {
    super(
      `Expected success for ${testName}.${type}
${error.message}
Input: ${JSON.stringify(data, null, 2)}`
    )
  }
}
