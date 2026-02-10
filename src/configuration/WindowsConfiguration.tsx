import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { getUnicodeName } from "../symbol/symbolTable"
import { baseKeyMap } from "../symbol/windowsKeyMap"

export interface WindowsConfigurationProp {
  keyboard: Keyboard
}

export function WindowsConfiguration(props: WindowsConfigurationProp) {
  let { keyboard } = props
  let { characterTable } = keyboard.layout

  let contentTable: string[] = []

  const keyMap: { sc: string; vk: string }[][] = baseKeyMap.map((row) =>
    row.slice(),
  )
  if (keyboard.hasLSGT === "LSGT") {
    keyMap[3] = [{ sc: "56", vk: "OEM_102" }, ...keyMap[3]!]
  }

  const formatUnicodeName = (symbol: string) => {
    let name = getUnicodeName(symbol)
    name = name.replace(/^LATIN SMALL LETTER /, "letter ")
    name = name.replace(/^LATIN CAPITAL LETTER /, "LETTER ")
    return name
  }

  const formatOutputValue = (symbol?: string) => {
    if (!symbol) {
      return "-1"
    }
    if (symbol === " ") {
      return "0020"
    }
    return symbol
  }

  const formatCommentName = (symbol?: string) => {
    return symbol ? formatUnicodeName(symbol) : "<none>"
  }

  const deriveVk = (group: string[], fallbackVk: string) => {
    let resultVk = fallbackVk
    const candidates = [group[0], group[1]].filter(Boolean) as string[]
    const digit = candidates.find((c) => /^[0-9]$/.test(c))
    if (digit) {
      resultVk = digit
    }
    const letter = candidates.find((c) => /^[a-zA-Z]$/.test(c))
    if (letter) {
      resultVk = letter.toUpperCase()
    }
    return resultVk + (resultVk.length < 8 ? "\t" : "")
  }

  characterTable.forEach((row, rowIndex) => {
    const rowMap = keyMap[rowIndex]
    if (!rowMap) {
      return
    }
    row.forEach((group, columnIndex) => {
      const key = rowMap[columnIndex]
      if (!key) {
        return
      }

      const [c0, c1, c6, c7] = group.map((c) => c || "")

      if (!c0 && !c1 && !c6 && !c7) {
        return
      }

      const vk = deriveVk(group, key.vk)
      const cap = c0 === " " ? "0" : c6 || c7 ? "5" : "1"

      const characters = [c0, c1, c6, c7].map(formatOutputValue).join(", ")
      const comment = [c0, c1, c6, c7].map(formatCommentName).join(", ")

      contentTable.push(
        `${key.sc}\t${vk}\t${cap}\t${characters}\t\t// ${comment}`,
      )
    })
  })

  const warning = (
    <>
      If you copy the layout, remember that the file must be saved with UTF-16
      (LE) encoding and CRLF line endings. The file download uses the right
      encoding and line endings.
    </>
  )

  const configText = `
KBD	${keyboard.name}	"${keyboard.longName}"

COPYRIGHT	"(c) 2026 Your Name Here"

COMPANY	"Your Company Name Here"

LOCALENAME	"en-US"

LOCALEID	"00000409"

VERSION	1.0

SHIFTSTATE

0	//Column 4
1	//Column 5 : Shft
6	//Column 6 :       Ctrl Alt
7	//Column 7 : Shft  Ctrl Alt

LAYOUT		;an extra '@' at the end is a dead key

//SC	VK_		Cap	0	1	2	6	7
//--	----		----	----	----	----	----	----

${contentTable.join("\n")}

DESCRIPTIONS

0409	${keyboard.name}

LANGUAGENAMES

0409	English (United States)

ENDKBD
`.slice(1, -1)

  return (
    <ConfigurationTemplate
      title="Windows Configuration"
      defaultedKeyboardName={keyboard.defaultedName}
      fileExtension="klc"
      fileNewline="crlf"
      fileEncoding="utf-16le"
      keyboardConfigText={configText}
      warning={warning}
    >
      <p>
        This configuration format is used by{" "}
        <a href="https://www.google.com/search?q=Microsoft+Keyboard+Layout+Creator">
          Microsoft Keyboard Layout Creator
        </a>{" "}
        (MSKLC). MSKLC can open, edit and most importantly, compile this
        configuration into a set of `.msi` and `.exe` files which install the
        keyboard layout into Windows.
      </p>
    </ConfigurationTemplate>
  )
}
