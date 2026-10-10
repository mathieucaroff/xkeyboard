const androidKeys = [
  [
    "GRAVE",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "MINUS",
    "EQUALS",
  ],
  [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "LEFT_BRACKET",
    "RIGHT_BRACKET",
    "BACKSLASH",
  ],
  [
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "SEMICOLON",
    "APOSTROPHE",
    "BACKSLASH",
  ],
  ["Z", "X", "C", "V", "B", "N", "M", "COMMA", "PERIOD", "SLASH"],
]

export interface AndroidKcmConfigurationResult {
  text: string
  errors: string[]
  warnings: string[]
}

export function getAndroidKcmKeyName(
  position: Pick<Position, "row" | "column">,
  hasLSGT: HasLSGT,
): string | null {
  const { row, column } = position
  if (row === 3 && hasLSGT === "LSGT") {
    return column === 0 ? "RO" : (androidKeys[row]?.[column - 1] ?? null)
  }
  return androidKeys[row]?.[column] ?? null
}

export function getAndroidKcmCharacter(character: string): string {
  if (!character) {
    return "none"
  }
  const code = character.codePointAt(0)!
  if (
    character.length !== 1 ||
    (code >= 0xd800 && code <= 0xdfff) ||
    code < 0x20 ||
    (code >= 0x7f && code <= 0x9f) ||
    code === 0xef00 ||
    code === 0xef01 ||
    /\p{M}/u.test(character)
  ) {
    throw new Error(
      "Expected one printable BMP character, excluding surrogates, combining marks and Android reserved U+EF00/U+EF01 actions.",
    )
  }
  if (character === "\\" || character === "'") {
    return `'\\${character}'`
  }
  return code <= 0x7e
    ? `'${character}'`
    : `'\\u${code.toString(16).toUpperCase().padStart(4, "0")}'`
}

function isCasePair(base: string, shifted: string): boolean {
  return (
    base !== shifted &&
    base.length === 1 &&
    shifted.length === 1 &&
    base.toUpperCase() === shifted.toUpperCase() &&
    base.toLowerCase() === shifted.toLowerCase()
  )
}

export function generateAndroidKcmConfiguration(
  keyboard: Keyboard,
): AndroidKcmConfigurationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const hasLSGT = keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT"
  const lines = [
    `# ${keyboard.longName.replace(/[\r\n\u2028\u2029]/g, " ")}`,
    "# Android physical-keyboard layout-provider overlay, not a standalone map.",
    "# Assumes standard PC / Generic.kl Android key bindings.",
    "# Unspecified keys retain the device baseline; empty levels type nothing.",
    "# Right Alt selects levels 3/4; Ctrl, left Alt and Meta do not type text.",
    "",
    "type OVERLAY",
    "",
  ]
  if (hasLSGT === "LSGT") {
    lines.push("map key 86 RO", "")
    warnings.push(
      "The ISO extra key uses Linux scan code 86 mapped to Android RO to distinguish it from Backslash. Verify this on your hardware; this overlay is not intended for JIS keyboards with a separate RO key.",
    )
  }
  if (keyboard.kind === "TypeMatrix") {
    warnings.push(
      "TypeMatrix assumes standard PC / Generic.kl key bindings. Verify the physical keycodes on your Android device.",
    )
  }
  const assignedKeys = new Set<string>()
  let populatedKeys = 0
  keyboard.layout.characterTable.forEach((row, rowIndex) => {
    row.forEach((group, columnIndex) => {
      const location = `Row ${rowIndex + 1}, key ${columnIndex + 1}`
      const keyName = getAndroidKcmKeyName(
        { row: rowIndex, column: columnIndex },
        hasLSGT,
      )
      if (keyName === null) {
        errors.push(`${location}: no Android physical-key mapping.`)
        return
      }
      if (assignedKeys.has(keyName)) {
        errors.push(
          `${location}: duplicate Android key ${keyName}. Use only one backslash position.`,
        )
        return
      }
      assignedKeys.add(keyName)
      const levelCount = keyboard.layout.complexity === "complex" ? 4 : 2
      if (group.slice(levelCount).some(Boolean)) {
        errors.push(`${location}: too many character levels.`)
        return
      }
      const characters =
        keyboard.layout.complexity === "complex"
          ? [group[0] ?? "", group[1] ?? "", group[2] ?? "", group[3] ?? ""]
          : [group[0] ?? "", group[1] ?? "", group[0] ?? "", group[1] ?? ""]
      const symbols: string[] = []
      characters.forEach((character, levelIndex) => {
        try {
          symbols.push(getAndroidKcmCharacter(character))
        } catch (error) {
          errors.push(
            `${location}, level ${levelIndex + 1}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      })
      if (symbols.length !== 4) {
        return
      }
      if (characters.some(Boolean)) {
        populatedKeys += 1
      }
      const label = isCasePair(characters[0]!, characters[1]!)
        ? characters[1]!
        : (characters.find(Boolean) ?? "")
      const number =
        characters.find((character) => /^[0-9]$/.test(character)) ??
        characters.find((character) => /^[()#*\-+,.'/:;]$/.test(character)) ??
        ""
      lines.push(
        `key ${keyName} {`,
        `    label: ${getAndroidKcmCharacter(label)}`,
        `    number: ${getAndroidKcmCharacter(number)}`,
        `    base: ${symbols[0]}`,
        `    shift: ${symbols[1]}`,
      )
      if (isCasePair(characters[0]!, characters[1]!)) {
        lines.push(
          `    capslock: ${symbols[1]}`,
          `    shift+capslock: ${symbols[0]}`,
        )
      }
      lines.push(`    ralt: ${symbols[2]}`, `    shift+ralt: ${symbols[3]}`)
      if (isCasePair(characters[2]!, characters[3]!)) {
        lines.push(
          `    capslock+ralt: ${symbols[3]}`,
          `    shift+capslock+ralt: ${symbols[2]}`,
        )
      }
      lines.push("    ctrl, lalt, meta: none", "}", "")
    })
  })
  if (populatedKeys === 0) {
    errors.push(
      "Enter a keyboard layout with printable characters before exporting an Android map.",
    )
  }
  return { text: lines.join("\n"), errors, warnings }
}
