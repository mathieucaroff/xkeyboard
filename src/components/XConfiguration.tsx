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

export function XConfiguration(props: XConfigurationProp) {
  let { keyboard } = props
  let { characterTable } = keyboard.layout

  let configurationLineArray: string[] = []
  Array.from({ length: 5 }, (_, row) => {
    if (row >= characterTable.length) {
      return
    }
    let position = { row, column: 0 }
    let characterGroup = characterTable[row][position.column] ?? []
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
      characterGroup = characterTable[row][position.column] ?? []
      trimEmptyStringsFromArrayEnd(characterGroup)
    }
    configurationLineArray.push("")
  })

  if (keyboard.layout.complexity === "complex") {
    configurationLineArray.push('  include "level3(ralt_switch)"')
  } else {
    configurationLineArray.pop()
  }

  return (
    <pre>
      {`
default partial alphanumeric_keys modifier_keys

xkb_symbols "${keyboard.name}" {
  name[Group1] = "${keyboard.groupName}";

${configurationLineArray.join("\n")}
};
`.slice(1, -1)}
    </pre>
  )
}
