import { Array, Record, String, Static } from 'runtypes'

export const InstructionSourceType = Record({
  file: String,
  type: String.Or(Array(String)),
})

export type InstructionSourceType = Static<typeof InstructionSourceType>

export const Instruction = Record({
  targetFile: String,
  sourceTypes: InstructionSourceType.Or(Array(InstructionSourceType)),
})

export type Instruction = Static<typeof Instruction>

export const Instructions = Array(Instruction)

export type Instructions = Static<typeof Instructions>
