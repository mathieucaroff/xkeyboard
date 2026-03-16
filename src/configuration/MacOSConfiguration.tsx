import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { getMacOSKeyCode } from "../getKeyName"

export interface MacOSConfigurationProps {
  keyboard: Keyboard
}

function escapeXML(text: string): string {
  return text.replace(/[^0-9A-Za-z`~!@#$%^*()\-=_+:{};\[\]?,./ ]/g, (char) => {
    return `&#x${char.codePointAt(0)!.toString(16).padStart(4, "0")};`
  })
}

export function MacOSConfiguration(props: MacOSConfigurationProps) {
  const { keyboard } = props
  const { characterTable } = keyboard.layout

  // Generate the XML sections
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE keyboard PUBLIC "" "file://localhost/System/Library/DTDs/KeyboardLayout.dtd">`

  const xmlKbName = keyboard.defaultedName
  const xmlKeyboardStart = `<keyboard group="126" id="-1" name="${xmlKbName}" maxout="1">`
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

  const xmlKeyMapLevelList: string[] = [0, 1, 2, 3].map((mapIndex) => {
    return characterTable
      .map((row, rowIndex) => {
        const charList: string[] = []
        const lineList = row
          .map((column, columnIndex) => {
            const code = getMacOSKeyCode(
              { row: rowIndex, column: columnIndex },
              keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT",
            )
            const char = column[mapIndex]
            if (code === null || !char) {
              return null
            }
            charList.push(char)
            return `      <key code="${code}" output="${escapeXML(char)}"/>`
          })
          .filter(Boolean)
        lineList.unshift(`      <!-- ${charList.join(", ")} -->`)
        return lineList.join("\n")
      })
      .filter(Boolean)
      .join("\n\n")
  })

  const getKeyMapText = (index: number): string => {
    return `<keyMap index="${index}">
      <key code="49" output=" "/>       <!-- Space -->
      <key code="36" output="&#x000A;"/><!-- Enter -->
      <key code="51" output="&#x0008;"/><!-- Backspace -->
      <key code="48" output="&#x0009;"/><!-- Tab -->
      <key code="53" output="&#x001B;"/><!-- Escape -->

${xmlKeyMapLevelList[index]}
    </keyMap>`
  }

  const xmlKeyMaps = `  <keyMapSet id="ANSI">
    <!-- Base keymap (no modifiers) -->
    ${getKeyMapText(0)}

    <!-- Shift keymap -->
    ${getKeyMapText(1)}

    <!-- Option keymap -->
    ${getKeyMapText(2)}

    <!-- Shift+Option keymap -->
    ${getKeyMapText(3)}
  </keyMapSet>`

  const xmlKeyboardConfig = [
    xmlHeader,
    xmlKeyboardStart,
    xmlLayouts,
    xmlModifierMap,
    xmlKeyMaps,
    xmlKeyboardEnd,
  ].join("\n")

  return (
    <ConfigurationTemplate
      title="MacOS Configuration"
      defaultedKeyboardName={keyboard.defaultedName}
      fileExtension="keylayout"
      keyboardConfigText={xmlKeyboardConfig}
    >
      <p>Installation Instructions:</p>
      <ol>
        <li>
          Save this file as "<code>{keyboard.defaultedName}.keylayout</code>"
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
        <strong>Note:</strong> The group ID (126) is for custom layouts.
      </p>
    </ConfigurationTemplate>
  )
}
