export type Symbol = string

export interface Keyboard {
  kind: KeyboardKind
  name: string
  groupName: string
  layout: KeyboardLayout
  hasLSGT: HasLSGT
  hasNavigationPad: HasNavigationPad
  hasNumpad: HasNumpad
}

export interface KeyboardLayout {
  complexity: Complexity
  characterTable: Symbol[][][]
}

export type KeyboardKind = "Basic" | "TypeMatrix"
export type Complexity = "simple" | "complex"
export type HasLSGT = "noLSGT" | "LSGT"
export type HasNavigationPad = "noNavigationPad" | "NavigationPad"
export type HasNumpad = "noNumpad" | "Numpad"

export interface Position {
  row: number
  column: number
}
