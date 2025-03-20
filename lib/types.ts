export interface StringArtInstruction {
  nailNumber: number
}

export interface StringArtThread {
  color: number[] // RGB values [r, g, b]
  instructions: StringArtInstruction[]
}

export interface StringArtProject {
  threads: StringArtThread[]
  totalInstructions: number
}

