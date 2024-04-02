export type Symbol = string

export interface Keyboard {
  kind: KeyboardKind
  name: string
  groupName: string
  layout: KeyboardLayout
  hasNavigationPad: boolean
  hasNumpad: boolean
}

export interface KeyboardLayout {
  complexity: Complexity
  characterTable: Symbol[][]
}

export type KeyboardKind = "Basic" | "TypeMatrix"
export type Complexity = "simple" | "complex"

export interface Position {
  row: number
  column: number
}
