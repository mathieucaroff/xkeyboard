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

  /** Work item used during phased VK assignment before rendering output rows. */
  interface KeyAssignment {
    /** Hardware scan code used in the KLC output. */
    sc: string
    /** VK naturally associated with this physical key position. */
    positionVk: string
    /** Character outputs for shift states [0, 1, 6, 7]. */
    group: string[]
    /** Row index in the keyboard matrix, used for ordering. */
    rowIndex: number
    /** Column index in the keyboard matrix, used for ordering. */
    columnIndex: number
    /** Final VK selected by the phased assignment logic. */
    assignedVk?: string
  }

  const keyMap: { sc: string; vk: string }[][] = baseKeyMap.map((row) => [
    ...row,
  ])
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
    if (symbol.match(/^[0-9A-Za-z]$/)) {
      return symbol
    }
    return symbol.codePointAt(0)!.toString(16).padStart(4, "0")
  }

  const formatCommentName = (symbol?: string) => {
    return symbol ? formatUnicodeName(symbol) : "<none>"
  }

  const isAlphaNumeric = (value?: string) =>
    Boolean(value?.match(/^[0-9A-Za-z]$/))
  const isOemVk = (value: string) => value.startsWith("OEM_")
  const formatVk = (value: string) => value + (value.length < 8 ? "\t" : "")

  // Phase A: derive VK from unshifted first, otherwise shifted, when alphanumeric.
  const deriveInitialVk = (group: string[]) => {
    if (isAlphaNumeric(group[0])) {
      return group[0]!.toUpperCase()
    }
    if (isAlphaNumeric(group[1])) {
      return group[1]!.toUpperCase()
    }
    return undefined
  }

  const availableDigits = Array.from({ length: 10 }, (_, index) =>
    index.toString(),
  )
  const availableLetters = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode(65 + index),
  )
  const fallbackOemVks = [
    ...Array.from({ length: 7 }, (_, index) => `OEM_${index + 1}`),
    "OEM_102",
    "OEM_MINUS",
    "OEM_PLUS",
    "OEM_COMMA",
    "OEM_PERIOD",
  ]

  // `usedVks` is global uniqueness tracking across digit/letter/OEM assignments.
  const keyAssignments: KeyAssignment[] = []
  const usedVks = new Set<string>()

  const claimVk = (vk?: string) => {
    if (!vk || usedVks.has(vk)) {
      return false
    }
    usedVks.add(vk)
    return true
  }

  const findFirstUnclaimed = (candidates: string[]) => {
    return candidates.find((candidate) => !usedVks.has(candidate))
  }

  // Collect keys in row-major order so collision handling matches the spec.
  characterTable.forEach((row, rowIndex) => {
    const rowMap = keyMap[rowIndex]
    if (!rowMap) {
      return
    }
    row.forEach((group, columnIndex) => {
      const key = rowMap[columnIndex]
      if (!key) {
        console.warn(
          `No key mapping found for scancode ${rowIndex.toString(16)} column ${columnIndex}`,
        )
        return
      }

      const [c0, c1, c6, c7] = group

      if (!c0 && !c1 && !c6 && !c7) {
        return
      }

      keyAssignments.push({
        sc: key.sc,
        positionVk: key.vk,
        group,
        rowIndex,
        columnIndex,
      })
    })
  })

  // Phase A+B: assign derived alphanumeric VKs, resolving collisions via 0-9 then A-Z.
  keyAssignments.forEach((assignment) => {
    const initialVk = deriveInitialVk(assignment.group)
    if (!initialVk) {
      return
    }

    if (claimVk(initialVk)) {
      assignment.assignedVk = initialVk
      return
    }

    const replacementVk = findFirstUnclaimed([
      ...availableDigits,
      ...availableLetters,
    ])
    if (!replacementVk) {
      return
    }

    claimVk(replacementVk)
    assignment.assignedVk = replacementVk
  })

  // Phase C: for still-unassigned keys, use their positional OEM VK when available.
  keyAssignments.forEach((assignment) => {
    if (assignment.assignedVk) {
      return
    }
    if (!isOemVk(assignment.positionVk)) {
      return
    }
    if (!claimVk(assignment.positionVk)) {
      return
    }
    assignment.assignedVk = assignment.positionVk
  })

  // Phase D: assign from fallback OEM pool, then any remaining 0-9/A-Z VKs.
  keyAssignments.forEach((assignment) => {
    if (assignment.assignedVk) {
      return
    }

    const fallbackVk = findFirstUnclaimed([
      ...fallbackOemVks,
      ...availableDigits,
      ...availableLetters,
    ])
    if (!fallbackVk) {
      return
    }

    claimVk(fallbackVk)
    assignment.assignedVk = fallbackVk
  })

  // Phase E: unassignable keys are omitted from output and reported to the console.
  const droppedAssignments = keyAssignments.filter(
    (assignment) => !assignment.assignedVk,
  )
  if (droppedAssignments.length > 0) {
    console.warn(
      `Windows configuration dropped ${droppedAssignments.length} key(s) without an available VK: ${droppedAssignments
        .map(
          ({ sc, rowIndex, columnIndex }) =>
            `${sc} (row ${rowIndex}, column ${columnIndex})`,
        )
        .join(", ")}`,
    )
  }

  // Emit only keys that ended up with a VK.
  keyAssignments.forEach((assignment) => {
    if (!assignment.assignedVk) {
      return
    }

    const [c0, c1, c6, c7] = assignment.group

    // Cap value 5 means the KLC row exposes all shift states (0, 1, 6, 7).
    // XKeyboard does not support dead keys, so this is always correct here.
    const cap = "5"

    const characters = [c0, c1, c6, c7].map(formatOutputValue).join(" ")
    const comment = [c0, c1, c6, c7].map(formatCommentName).join(" ")
    const formattedVk = formatVk(assignment.assignedVk)

    contentTable.push(
      `${assignment.sc}\t${formattedVk}\t${cap}\t${characters}\t\t// ${comment}`,
    )
  })

  const warning = (
    <>
      If you copy the layout, remember that the file must be saved with UTF-16
      (LE) encoding and CRLF line endings. The file download uses the right
      encoding and line endings.
    </>
  )

  const kbName = keyboard.name.replaceAll(/[^A-Za-z0-9_]/g, "").slice(0, 8)

  const configText = `
KBD	${kbName}	"${keyboard.longName}"

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

//SC	VK_		Cap	0	1	6	7
//--	---		---	---	---	---	---

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
