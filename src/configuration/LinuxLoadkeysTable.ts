const consoleKeycodes = [
  [41, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 43],
  [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 43],
  [44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
]

const asciiSymbols: Record<string, string> = {
  " ": "space",
  "!": "exclam",
  '"': "quotedbl",
  "#": "numbersign",
  "$": "dollar",
  "%": "percent",
  "&": "ampersand",
  "'": "apostrophe",
  "(": "parenleft",
  ")": "parenright",
  "*": "asterisk",
  "+": "plus",
  ",": "comma",
  "-": "minus",
  ".": "period",
  "/": "slash",
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  ":": "colon",
  ";": "semicolon",
  "<": "less",
  "=": "equal",
  ">": "greater",
  "?": "question",
  "@": "at",
  "[": "bracketleft",
  "\\": "backslash",
  "]": "bracketright",
  "^": "asciicircum",
  "_": "underscore",
  "`": "grave",
  "{": "braceleft",
  "|": "bar",
  "}": "braceright",
  "~": "asciitilde",
}

const modifiers = [
  "plain",
  "shift",
  "altgr",
  "shift altgr",
  "control",
  "shift control",
  "altgr control",
  "shift altgr control",
  "alt",
  "shift alt",
  "altgr alt",
  "shift altgr alt",
  "control alt",
  "shift control alt",
  "altgr control alt",
  "shift altgr control alt",
]

export interface LoadkeysConfigurationResult {
  text: string
  errors: string[]
  warnings: string[]
}

export function getLinuxLoadkeysKeyCode(
  position: Position,
  hasLSGT: HasLSGT,
): number | null {
  const { row, column } = position
  if (row === 3 && hasLSGT === "LSGT") {
    return column === 0 ? 86 : (consoleKeycodes[row]?.[column - 1] ?? null)
  }
  return consoleKeycodes[row]?.[column] ?? null
}

export function getLinuxLoadkeysSymbol(character: string): string {
  if (!character) {
    return "VoidSymbol"
  }
  const code = character.codePointAt(0)!
  if (
    Array.from(character).length !== 1 ||
    (code >= 0xd800 && code <= 0xdfff) ||
    code >= 0xf000 ||
    code < 0x20 ||
    (code >= 0x7f && code <= 0x9f)
  ) {
    throw new Error(
      "Expected one printable character below U+F000 (excluding surrogates).",
    )
  }
  return (
    asciiSymbols[character] ??
    (/^[a-zA-Z]$/.test(character)
      ? character
      : `U+${code.toString(16).toUpperCase().padStart(4, "0")}`)
  )
}

function getControlSymbol(character: string): string {
  if (/^[a-zA-Z]$/.test(character)) {
    return `Control_${character.toLowerCase()}`
  }
  const controls: Record<string, string> = {
    " ": "nul",
    "@": "nul",
    "2": "nul",
    "[": "Escape",
    "3": "Escape",
    "\\": "Control_backslash",
    "4": "Control_backslash",
    "]": "Control_bracketright",
    "5": "Control_bracketright",
    "^": "Control_asciicircum",
    "6": "Control_asciicircum",
    "_": "Control_underscore",
    "7": "Control_underscore",
    "?": "Delete",
    "8": "Delete",
  }
  return controls[character] ?? "VoidSymbol"
}

function isCasePair(first: string, second: string) {
  return (
    first !== second &&
    first.toLowerCase() === second.toLowerCase() &&
    first.toUpperCase() === second.toUpperCase() &&
    Array.from(first).length === 1 &&
    Array.from(second).length === 1
  )
}

export function generateLinuxLoadkeysConfiguration(
  keyboard: Keyboard,
): LoadkeysConfigurationResult {
  const errors: string[] = []
  const warningSet = new Set<string>()
  const lines = [
    `# ${keyboard.longName.replace(/[\r\n\u2028\u2029]/g, " ")}`,
    "# Linux console overlay: load a baseline map (us) before this file.",
    "# Special keys, navigation and keypad bindings come from the baseline.",
    "# Empty levels and unsupported Ctrl/Meta combinations produce no output.",
    "# Unicode input requires a Unicode-mode console and a suitable console font.",
    "",
  ]
  const assignedCodes = new Set<number>()
  const hasLSGT = keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT"
  if (keyboard.kind === "TypeMatrix") {
    warningSet.add(
      "TypeMatrix uses standard PC keycodes; verify the hardware with showkey --keycodes.",
    )
  }

  keyboard.layout.characterTable.forEach((row, rowIndex) => {
    row.forEach((group, columnIndex) => {
      const location = `Row ${rowIndex + 1}, key ${columnIndex + 1}`
      const keycode = getLinuxLoadkeysKeyCode(
        { row: rowIndex, column: columnIndex },
        hasLSGT,
      )
      if (keycode === null) {
        errors.push(`${location}: no Linux console keycode mapping.`)
        return
      }
      if (assignedCodes.has(keycode)) {
        errors.push(
          `${location}: duplicate console keycode ${keycode}. Use only one backslash position.`,
        )
        return
      }
      assignedCodes.add(keycode)
      const characters =
        keyboard.layout.complexity === "complex"
          ? [group[0] ?? "", group[1] ?? "", group[2] ?? "", group[3] ?? ""]
          : [group[0] ?? "", group[1] ?? "", group[0] ?? "", group[1] ?? ""]
      if (
        group
          .slice(keyboard.layout.complexity === "complex" ? 4 : 2)
          .some(Boolean)
      ) {
        errors.push(`${location}: too many character levels.`)
        return
      }
      let symbols: string[]
      try {
        symbols = characters.map(getLinuxLoadkeysSymbol)
      } catch (error) {
        errors.push(
          `${location}: ${error instanceof Error ? error.message : String(error)}`,
        )
        return
      }
      for (const offset of [0, 2]) {
        const first = characters[offset]!
        const second = characters[offset + 1]!
        if (isCasePair(first, second)) {
          if (first.codePointAt(0)! <= 0xff && second.codePointAt(0)! <= 0xff) {
            symbols[offset] = `+${symbols[offset]}`
            symbols[offset + 1] = `+${symbols[offset + 1]}`
          } else {
            warningSet.add(
              "Caps Lock is supported for ASCII and Latin-1 case pairs only; other letters retain their explicit Shift levels.",
            )
          }
        }
      }
      modifiers.forEach((modifier, mapIndex) => {
        const level = mapIndex & 3
        const character = characters[level]!
        const control = Boolean(mapIndex & 4)
        const meta = Boolean(mapIndex & 8)
        let symbol = control ? getControlSymbol(character) : symbols[level]!
        if (meta && symbol !== "VoidSymbol") {
          symbol = control
            ? `Meta_${symbol}`
            : character.codePointAt(0)! < 0x7f
              ? `Meta_${getLinuxLoadkeysSymbol(character)}`
              : "VoidSymbol"
        }
        lines.push(`${modifier} keycode ${keycode} = ${symbol}`)
      })
      lines.push("")
    })
  })

  if (keyboard.layout.complexity === "complex") {
    for (const modifier of modifiers) {
      lines.push(`${modifier} keycode 100 = AltGr`)
    }
    lines.push("")
  }
  if (assignedCodes.size === 0) {
    errors.push("Enter a keyboard layout before exporting a console map.")
  }
  return { text: lines.join("\n"), errors, warnings: [...warningSet] }
}
