export interface Instruction {
  targetFile: string
  sourceTypes: InstructionSourceType | InstructionSourceType[]
}

export type Instructions = Instruction | Instruction[]

export interface InstructionSourceType {
  file: string
  type: string | string[]
}
