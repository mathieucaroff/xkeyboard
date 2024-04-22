import { HasLSGT, Position } from "./type"

export function getKeyName(position: Position, hasLSGT: HasLSGT) {
  let { row, column } = position
  if (row === 0) {
    if (column === 0) {
      return "TLDE"
    }
  } else if (row === 3 && hasLSGT === 'LSGT') {
    if (column === 0) {
      return "LSGT"
    }
  }else {
    column += 1
  }
  if (row === 1 && column === 13) {
    return "BKSL"
  }
  let rowLetter = "EDCBA"[row]
  return `A${rowLetter}${String(column).padStart(2, "0")}`
}
