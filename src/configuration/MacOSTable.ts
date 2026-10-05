const MAC_OS_KEYCODE_TABLE = [
  [10, 18, 19, 20, 21, 23, 22, 26, 28, 25, 29, 27, 24],
  [null, 12, 13, 14, 15, 17, 16, 32, 34, 31, 35, 33, 30, 42],
  [null, 0, 1, 2, 3, 5, 4, 38, 40, 37, 41, 39, 42],
  [50, 6, 7, 8, 9, 11, 45, 46, 43, 47, 44],
]

export function getMacOSKeyCode(
  position: Position,
  hasLSGT: HasLSGT,
): number | null {
  let { row, column } = position
  if (row > 0 && !(row === 3 && hasLSGT === "LSGT")) {
    column += 1
  }
  return MAC_OS_KEYCODE_TABLE[row]?.[column] ?? null
}
