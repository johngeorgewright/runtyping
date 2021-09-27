const TYPE_PLACEHOLDER = '{type}'

class TypeNameFormatter {
  readonly #runtypeFormat?: string
  readonly #typeFormat?: string

  constructor({
    runtypeFormat,
    typeFormat,
  }: { runtypeFormat?: string; typeFormat?: string } = {}) {
    // Make sure the (run)typeFormat look as we expect them to (but only IF they were supplied at all)
    if (runtypeFormat && runtypeFormat.indexOf(TYPE_PLACEHOLDER) === -1) {
      throw new Error(
        `runtypeFormat must contain placeholder '${TYPE_PLACEHOLDER}'`
      )
    }
    if (typeFormat && typeFormat.indexOf(TYPE_PLACEHOLDER) === -1) {
      throw new Error(
        `typeFormat must contain placeholder '${TYPE_PLACEHOLDER}'`
      )
    }
    this.#runtypeFormat = runtypeFormat
    this.#typeFormat = typeFormat
  }

  formatRuntypeName(originalName: string) {
    if (this.#runtypeFormat) {
      return this.#runtypeFormat.replace(TYPE_PLACEHOLDER, originalName)
    }
    return originalName
  }

  formatTypeName(originalName: string) {
    if (this.#typeFormat) {
      return this.#typeFormat.replace(TYPE_PLACEHOLDER, originalName)
    }
    return originalName
  }
}

export default TypeNameFormatter
