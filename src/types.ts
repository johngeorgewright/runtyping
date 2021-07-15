export type Instruction = {
  targetFile: string
  sourceTypes: InstructionSourceType[]
}

export type Instructions = Instruction[]

export interface InstructionSourceType {
  file: string
  type: string
}
