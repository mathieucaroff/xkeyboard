// Type declarations for Parcel bundle-text imports
declare module "bundle-text:*" {
  const content: string
  export default content
}

// Ambient type declarations
type KeySymbol = string

interface Keyboard {
  kind: KeyboardKind
  name: string
  groupName: string
  layout: KeyboardLayout
  hasLSGT: HasLSGT
  hasNavigationPad: HasNavigationPad
  hasNumpad: HasNumpad
}

interface KeyboardLayout {
  complexity: Complexity
  characterTable: KeySymbol[][][]
}

type KeyboardKind = "Basic" | "TypeMatrix"
type Complexity = "simple" | "complex"
type HasLSGT = "noLSGT" | "LSGT"
type HasNavigationPad = "noNavigationPad" | "NavigationPad"
type HasNumpad = "noNumpad" | "Numpad"

interface Position {
  row: number
  column: number
}

type DotConfig =
  | {
      dotAsEmpty: true
      realDots: Position[]
    }
  | {
      dotAsEmpty: false
    }
