import { Array, Record, String, Static } from 'runtypes'

export const Instructions = Array(
  Record({
    targetFile: String,
    sourceTypes: Array(Record({ file: String, type: String })),
  })
)

export type Instructions = Static<typeof Instructions>
