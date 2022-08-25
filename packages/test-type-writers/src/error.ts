export class ExpectedFailure extends Error {
  constructor(
    public readonly testName: string,
    public readonly type: string,
    public readonly data: unknown
  ) {
    super(
      `Expected a failure for ${testName}.${type} but it succeeded
Input: ${stringify(data)}`
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
      `Expected success for ${testName}.${type} but it failed
${error.message}
Input: ${stringify(data)}`
    )
  }
}

function stringify(data: unknown) {
  return typeof data === 'function'
    ? data.toString()
    : JSON.stringify(data, null, 2)
}
