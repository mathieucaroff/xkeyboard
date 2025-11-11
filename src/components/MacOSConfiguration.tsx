import { getMacOSKeyCode } from "../getKeyName"

export interface MacOSConfigurationProps {
  keyboard: Keyboard
}

interface KeyMapEntry {
  code: number
  output: string
  name: string
  special?: "lineBreak" | "comment"
}

const LINE_BREAK_ENTRY: KeyMapEntry = {
  code: 0,
  output: "",
  name: "",
  special: "lineBreak",
}

interface ModifierMap {
  base: KeyMapEntry[][] // Renamed from 'anyOption' for clarity - stores base characters (no modifiers)
  option: KeyMapEntry[][]
  shift: KeyMapEntry[][]
  shiftOption: KeyMapEntry[][] // Renamed from 'command' to be more descriptive
}

interface LeanModifierMapSet {
  base: KeyMapEntry[]
  option: KeyMapEntry[]
  shift: KeyMapEntry[]
  shiftOption: KeyMapEntry[]
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Generates Unicode hex representation for characters
 */
function getUnicodeOutput(character: string) {
  if (!character) {
    return { output: "", name: "" }
  }

  if (character.length === 1) {
    const codePoint = character.codePointAt(0)!

    // Handle special cases for macOS
    switch (character) {
      case " ":
        return { output: "&#x0020;", name: "space" }
      case "\t":
        return { output: "&#x0009;", name: "tab" }
      case "\n":
        return { output: "&#x000A;", name: "LF" }
      case "\r":
        return { output: "&#x000D;", name: "CR" }
      default:
        break
    }

    if (
      codePoint <= 0x7f &&
      character.match(/[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':",./<>?`~]/)
    ) {
      // For safe ASCII characters, use the character directly
      const output = escapeXml(character)
      const name = output.startsWith("&") ? character : ""
      return { output: output, name }
    } else {
      // For Unicode characters or special ASCII, use Unicode hex
      const output = `&#x${codePoint.toString(16).padStart(4, "0").toUpperCase()};`
      return { output, name: character }
    }
  }
  return { output: escapeXml(character), name: character }
}

function processEntryRow(row: KeyMapEntry[]) {
  if (row.some((entry) => entry.name)) {
    return row.map((entry) => entry.name || entry.output).join(", ")
  }
  return ""
}

export function MacOSConfiguration(props: MacOSConfigurationProps) {
  const { keyboard } = props
  const { characterTable } = keyboard.layout

  // Build the modifier maps
  const modifierMaps: ModifierMap = {
    base: [], // Base characters (no modifiers)
    option: [],
    shift: [],
    shiftOption: [], // Renamed from 'command' for clarity
  }

  // Generate key mappings for each row
  for (let row = 0; row < Math.min(5, characterTable.length); row++) {
    const rowArray: KeyMapEntry[][] = [
      (modifierMaps.base[row] = []),
      (modifierMaps.shift[row] = []),
      (modifierMaps.option[row] = []),
      (modifierMaps.shiftOption[row] = []),
    ]

    let column = 0
    while (column < (characterTable[row]?.length || 0)) {
      const code = getMacOSKeyCode(
        { row, column },
        keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT",
      )

      if (code === null) {
        column++
        continue
      }

      characterTable[row]?.[column]?.forEach((char, index) => {
        if (char) {
          rowArray[index]!.push({
            code,
            ...getUnicodeOutput(char),
          })
        }
      })

      column++
    }
    rowArray.forEach((row) => {
      const rowSummary = processEntryRow(row)
      if (rowSummary) {
        row.unshift({
          special: "comment",
          output: rowSummary,
          name: "",
          code: 0,
        })
      }
    })
  }

  // Convert modifier maps to lean, i.e flattening the table into
  // an array of key entries. Newlines are added between non-empty rows.
  const leanModifierMaps: LeanModifierMapSet = {
    base: [],
    option: [],
    shift: [],
    shiftOption: [],
  }

  Object.entries(modifierMaps).forEach(
    ([modifierName, table]: [string, KeyMapEntry[][]]) => {
      const leanTable =
        leanModifierMaps[modifierName as keyof LeanModifierMapSet]
      table.forEach((row) => {
        leanTable.push(...row)
        if (
          leanTable.length > 0 &&
          leanTable.slice(-1)[0]?.special !== "lineBreak"
        ) {
          leanTable.push(LINE_BREAK_ENTRY)
        }
      })
      if (leanTable.slice(-1)[0]?.special === "lineBreak") {
        leanTable.pop()
      }
    },
  )

  // Generate the XML sections
  const keyboardId =
    keyboard.name.replace(/[^a-zA-Z0-9]/g, "") || "CustomKeyboard"
  const keyboardName =
    keyboard.groupName || keyboard.name || "Custom Keyboard Layout"

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE keyboard PUBLIC "" "file://localhost/System/Library/DTDs/KeyboardLayout.dtd">`

  const xmlKbName = escapeXml(keyboardName).replace(/'/g, "&#39;")
  const xmlKeyboardStart = `<keyboard group="126" id="${keyboardId}" name="${xmlKbName}" maxout="1">`
  const xmlKeyboardEnd = `</keyboard>`

  const xmlLayouts = `  <layouts>
    <layout first="0" last="17" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="18" last="18" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="21" last="23" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="30" last="30" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="33" last="33" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="36" last="36" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="194" last="194" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="197" last="197" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="200" last="201" mapSet="ANSI" modifiers="Modifiers"/>
    <layout first="206" last="207" mapSet="ANSI" modifiers="Modifiers"/>
  </layouts>`

  const xmlModifierMap = `  <modifierMap id="Modifiers" defaultIndex="0">
    <keyMapSelect mapIndex="0">
      <modifier keys=""/>
    </keyMapSelect>
    <keyMapSelect mapIndex="1">
      <modifier keys="anyShift"/>
    </keyMapSelect>
    <keyMapSelect mapIndex="2">
      <modifier keys="anyOption"/>
    </keyMapSelect>
    <keyMapSelect mapIndex="3">
      <modifier keys="anyShift anyOption"/>
    </keyMapSelect>
  </modifierMap>`

  // Generate all key maps using Object.fromEntries
  const xmlKeyMapSet = Object.fromEntries(
    Object.entries(leanModifierMaps).map(
      ([modifierName, entries]: [string, KeyMapEntry[]]) => [
        modifierName,
        [
          "      <!-- Space, Enter, Tab, Backspace, Escape -->",
          '      <key code="49" output=" "/>',
          '      <key code="36" output="&#x000D;"/>',
          '      <key code="48" output="&#x0009;"/>',
          '      <key code="51" output="&#x0008;"/>',
          '      <key code="53" output="&#x001B;"/>',
          "",
          ...entries.map(
            ({ code, output, special }: KeyMapEntry) =>
              ({
                comment: `      <!-- ${output} -->`,
                undefined: `      <key code="${code}" output="${output}"/>`,
                lineBreak: "",
              })[String(special)],
          ),
        ].join("\n"),
      ],
    ),
  )

  const xmlKeyMaps = `  <keyMapSet id="ANSI">
    <!-- Base keymap (no modifiers) -->
    <keyMap index="0">
${xmlKeyMapSet.base}
    </keyMap>

    <!-- Shift keymap -->
    <keyMap index="1">
${xmlKeyMapSet.shift}
    </keyMap>

    <!-- Option keymap -->
    <keyMap index="2">
${xmlKeyMapSet.option}
    </keyMap>

    <!-- Shift+Option keymap -->
    <keyMap index="3">
${xmlKeyMapSet.shiftOption}
    </keyMap>
  </keyMapSet>`

  const xmlContent = [
    xmlHeader,
    xmlKeyboardStart,
    xmlLayouts,
    xmlModifierMap,
    xmlKeyMaps,
    xmlKeyboardEnd,
  ].join("\n")

  return (
    <div>
      <p>macOS Keyboard Layout for: {keyboardName}</p>
      <p>
        Generated from keyboard layout: <strong>{keyboard.name}</strong>
      </p>

      <p>Installation Instructions:</p>
      <ol>
        <li>
          Save this file as "<code>{keyboardId}.keylayout</code>"
        </li>
        <li>
          Copy to <code>~/Library/Keyboard Layouts/</code> (for current user)
          <br />
          or <code>/Library/Keyboard Layouts/</code> (for all users)
        </li>
        <li>Restart your Mac or log out and log back in</li>
        <li>Go to System Preferences &gt; Keyboard &gt; Input Sources</li>
        <li>Click the "+" button and look for your layout under "Others"</li>
      </ol>

      <p>
        <strong>Note:</strong> The group ID (126) is for custom layouts. Virtual
        key codes are mapped from the original X11 layout to macOS virtual key
        codes.
      </p>
      <pre>{xmlContent}</pre>
    </div>
  )
}
