import { Array, Record, String, Static } from 'runtypes'

export const InstructionSourceType = Record({ file: String, type: String })

export type InstructionSourceType = Static<typeof InstructionSourceType>

export const Instructions = Array(
  Record({ targetFile: String, sourceTypes: Array(InstructionSourceType) })
)

export type Instructions = Static<typeof Instructions>
