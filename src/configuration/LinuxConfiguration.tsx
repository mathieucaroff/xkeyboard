import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { getKeyName } from "../getKeyName"
import { getSymbolName } from "../symbol/symbolTable"

function trimEmptyStringsFromArrayEnd(array: string[]) {
  while (array[array.length - 1] === "") {
    array.pop()
  }
}

export interface XConfigurationProp {
  keyboard: Keyboard
}

export function LinuxConfiguration(props: XConfigurationProp) {
  let { keyboard } = props
  let { characterTable } = keyboard.layout

  let configurationLineArray: string[] = []
  Array.from({ length: 5 }, (_, row) => {
    if (row >= characterTable.length) {
      return
    }
    let position = { row, column: 0 }
    let characterGroup = characterTable[row]![position.column] ?? []
    trimEmptyStringsFromArrayEnd(characterGroup)
    while (characterGroup.length > 0) {
      let keyName = getKeyName(
        position,
        keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT",
      )
      let line = `  key <${keyName}> { [ ${characterGroup.map((character) => getSymbolName(character)).join(", ")} ] };`
      if (
        characterGroup.some(
          (c) =>
            (c < "0" || c > "9") &&
            (c < "A" || c > "Z") &&
            (c < "a" || c > "z"),
        )
      ) {
        line += ` // ${characterGroup.join(" ")}`
      }
      configurationLineArray.push(line)
      position.column++
      characterGroup = characterTable[row]![position.column] ?? []
      trimEmptyStringsFromArrayEnd(characterGroup)
    }
    configurationLineArray.push("")
  })

  if (keyboard.layout.complexity === "complex") {
    configurationLineArray.push('  include "level3(ralt_switch)"')
  } else {
    configurationLineArray.pop()
  }

  const configText = `
default partial alphanumeric_keys modifier_keys

xkb_symbols "${keyboard.defaultedName}" {
  name[Group1] = "${keyboard.longName}";

${configurationLineArray.join("\n")}
};
`.slice(1, -1)

  return (
    <ConfigurationTemplate
      title="Linux / Unix, X11 / Wayland Configuration"
      defaultedKeyboardName={keyboard.defaultedName}
      fileExtension="xkb"
      keyboardConfigText={configText}
    >
      <div className="mt-6">Useful commands:</div>
      <ul className="m-0 pt-0">
        <li>
          <pre className="m-0 p-0 ml-2">vim /usr/share/X11/xkb/symbols/us</pre>
        </li>
        <li>
          <pre className="m-0 p-0 ml-2">setxkbmap -print -verbose 10</pre>
        </li>
        <li>
          <pre className="m-0 p-0 ml-2">{`setxkbmap us ${keyboard.defaultedName}`}</pre>
        </li>
        <li>
          For the GNOME desktop environment:
          <pre className="m-0 p-0 ml-2">{`gsettings set org.gnome.desktop.input-sources sources "[('xkb', 'us+${keyboard.defaultedName}')]"`}</pre>
        </li>
      </ul>
    </ConfigurationTemplate>
  )
}
