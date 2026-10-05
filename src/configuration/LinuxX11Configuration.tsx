import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { getKeyName, getSymbolName } from "./LinuxX11Table"

export interface LinuxX11ConfigurationProps {
  keyboard: Keyboard
}

export function LinuxX11Configuration(props: LinuxX11ConfigurationProps) {
  let { keyboard } = props
  let { characterTable } = keyboard.layout

  let configurationLineArray: string[] = []
  characterTable.slice(0, 5).forEach((row, rowIndex) => {
    row.forEach((group, column) => {
      const characterGroup = [...group]
      while (characterGroup.at(-1) === "") {
        characterGroup.pop()
      }
      if (characterGroup.length === 0) {
        return
      }
      let keyName = getKeyName(
        { row: rowIndex, column },
        keyboard.kind === "Basic" ? keyboard.hasLSGT : "noLSGT",
      )
      let line = `  key <${keyName}> { [ ${characterGroup.map((character) => getSymbolName(character) || "NoSymbol").join(", ")} ] };`
      if (
        characterGroup.some(
          (character) =>
            (character < "0" || character > "9") &&
            (character < "A" || character > "Z") &&
            (character < "a" || character > "z"),
        )
      ) {
        line += ` // ${characterGroup.join(" ")}`
      }
      configurationLineArray.push(line)
    })
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
