export interface Level {
  id: number
  title: string
  vulnerability: string
  tool: string
  description: string
  expectedCommand: string
  hint: string
}

export interface GameState {
  currentLevel: number
  completedLevels: number[]
  score: number
}
