import React from "react"
import { Keyboard, Position } from "../type"
import { getKeyName } from "../getKeyName"
import { getSymbol } from "../symbol/getSymbol"

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
  let groupSize = keyboard.layout.complexity === "simple" ? 2 : 4

  let readSymbolGroup = ({ row, column }: Position) => {
    let group = Array.from({ length: groupSize }, (_, offset) =>
      getSymbol((characterTable[groupSize * row + offset] ?? [])[column] ?? ""),
    )
    if (keyboard.layout.complexity === "simple") {
      return [group[1], group[0]]
    } else {
      return [group[1], group[0], group[3], group[2]]
    }
  }

  let configurationLineArray: string[] = []
  Array.from({ length: 5 }, (_, row) => {
    if (groupSize * (row + 1) > characterTable.length) {
      return
    }
    let position = { row, column: 0 }
    let symbolLine = readSymbolGroup(position)
    trimEmptyStringsFromArrayEnd(symbolLine)
    while (symbolLine.length > 0) {
      let keyName = getKeyName(position)
      configurationLineArray.push(
        `  key <${keyName}> { [ ${symbolLine.join(", ")} ] };`,
      )
      position.column++
      symbolLine = readSymbolGroup(position)
      trimEmptyStringsFromArrayEnd(symbolLine)
    }
    configurationLineArray.push("")
  })

  configurationLineArray.pop()

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
