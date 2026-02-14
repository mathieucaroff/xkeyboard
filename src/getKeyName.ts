export function getKeyName(position: Position, hasLSGT: HasLSGT) {
  let { row, column } = position
  if (row === 0) {
    if (column === 0) {
      return "TLDE"
    }
  } else if (row === 3 && hasLSGT === "LSGT") {
    if (column === 0) {
      return "LSGT"
    }
  } else {
    column += 1
  }
  if (row === 1 && column === 13) {
    return "BKSL"
  }
  let rowLetter = "EDCBA"[row]
  return `A${rowLetter}${String(column).padStart(2, "0")}`
}

const MAC_OS_KEYCODE_TABLE = [
  // Row 0: Number row (`1234567890-=)
  // Layout: `~ 1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) -_ =+
  [
    10, // Index 0: ` ~ (backtick/tilde)
    18, // Index 1: 1 !
    19, // Index 2: 2 @
    20, // Index 3: 3 #
    21, // Index 4: 4 $
    23, // Index 5: 5 %
    22, // Index 6: 6 ^
    26, // Index 7: 7 &
    28, // Index 8: 8 *
    25, // Index 9: 9 (
    29, // Index 10: 0 )
    27, // Index 11: - _
    24, // Index 12: = +
  ],

  // Row 1: Top letter row (QWERTYUIOP[])
  // Layout: Q W E R T Y U I O P [ ] (\ handled separately)
  [
    null, // Index 0 (unused)
    12, // Index 1: Q
    13, // Index 2: W
    14, // Index 3: E
    15, // Index 4: R
    17, // Index 5: T
    16, // Index 6: Y
    32, // Index 7: U
    34, // Index 8: I
    31, // Index 9: O
    35, // Index 10: P
    33, // Index 11: [ {
    30, // Index 12: ] }
    42, // Index 13: \ | // Keyboard-dependant
  ],

  // Row 2: Home row (ASDFGHJKL;')
  // Layout: A S D F G H J K L ; '
  [
    null, // Index 0 (unused)
    0, // Index 1: A
    1, // Index 2: S
    2, // Index 3: D
    3, // Index 4: F
    5, // Index 5: G
    4, // Index 6: H
    38, // Index 7: J
    40, // Index 8: K
    37, // Index 9: L
    41, // Index 10: ; :
    39, // Index 11: ' "
    42, // Index 12: \ | // Keyboard-dependant
  ],

  // Row 3: Bottom row (ZXCVBNM,./)
  // Layout: Z X C V B N M , . /
  [
    50, // Index 0 (unused, or LSGT key if present)
    6, // Index 1: Z
    7, // Index 2: X
    8, // Index 3: C
    9, // Index 4: V
    11, // Index 5: B
    45, // Index 6: N
    46, // Index 7: M
    43, // Index 8: , <
    47, // Index 9: . >
    44, // Index 10: / ?
  ],
]

/**
 * Gets macOS virtual key code directly from position
 * Based on https://developer.apple.com/library/archive/technotes/tn2450/_index.html
 */
export function getMacOSKeyCode(
  position: Position,
  hasLSGT: HasLSGT,
): number | null {
  let { row, column } = position

  // - Row 0 has an extra key to the left of the row (TLDE)
  // - The LSGT key, if present, is located on the left side of row 3
  if (row > 0 && !(row === 3 && hasLSGT === "LSGT")) {
    column += 1
  }

  // Return null for unknown positions
  return MAC_OS_KEYCODE_TABLE[row]?.[column] ?? null
}
