import { Checkbox, Input, Select } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { loadLayoutFiles } from "../lib/layoutFiles"
import { HelpTooltip } from "./HelpTooltip"

const layoutStorageKey = "xkeyboard-layout-editor"

const layoutPresets = loadLayoutFiles(
  import.meta.glob<string>("/layout/**/*.txt", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
)

type StoredLayoutState = {
  version: 1
  keyboardText: string
  keyboardComplexity: Complexity
  keyboardSelectValue: string
}

function isStoredLayoutState(value: unknown): value is StoredLayoutState {
  if (!value || typeof value !== "object") {
    return false
  }
  const state = value as StoredLayoutState
  return (
    state.version === 1 &&
    typeof state.keyboardText === "string" &&
    (state.keyboardComplexity === "simple" ||
      state.keyboardComplexity === "complex") &&
    typeof state.keyboardSelectValue === "string"
  )
}

function loadStoredLayoutState() {
  try {
    const raw = localStorage.getItem(layoutStorageKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as StoredLayoutState
    return isStoredLayoutState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function parseKeyboardText(text: string, complexity: Complexity) {
  let groupSize = complexity === "simple" ? 2 : 4

  let table = text.split(/\n+/g).map((line) => {
    let splitLine = line.split(/\s+/g)
    if (splitLine[0] === "") {
      splitLine.shift()
    }

    const replacementArray: string[] = []
    const row: string[] = []

    for (const c of splitLine) {
      ;(c.match(/^:.+/) ? replacementArray : row).push(c)
    }

    let replacementIndex = 0
    for (let i = 0; i < row.length; i++) {
      if (row[i] === ":" && replacementArray[replacementIndex]) {
        row[i] = replacementArray[replacementIndex]!
        replacementIndex++
      }
    }

    return row
  })

  let readCharacterGroup = ({ row, column }: Position): string[] => {
    let group = Array.from({ length: groupSize }, (_, offset) =>
      ((table[groupSize * row + offset] ?? [])[column] ?? "")
        .replace(/^\.$/, "")
        .replace(/^::$/, ":")
        .replace(/^:(\S)$/, "$1"),
    )

    if (complexity === "simple") {
      return [group[1]!, group[0]!]
    } else {
      return [group[1]!, group[0]!, group[3]!, group[2]!]
    }
  }
  Array.from({ length: 5 }, (_, row) => {
    if (groupSize * (row + 1) > table.length) {
      return
    }
  })

  let characterTable: string[][][] = []
  Array.from({ length: 5 }, (_, row) => {
    if (groupSize * (row + 1) > table.length) {
      return
    }
    let position = { row, column: 0 }
    let characterGroup = readCharacterGroup(position)
    let characterRow: string[][] = []
    while (characterGroup.some((c) => c !== "")) {
      characterRow.push(characterGroup)
      position.column++
      characterGroup = readCharacterGroup(position)
    }
    characterTable.push(characterRow)
  })

  return characterTable
}

function removeLSGT(text: string, complexity: Complexity) {
  let emptyLineCount = 0
  let lineArray = text.split("\n")
  lineArray.forEach((line, k) => {
    if (line.length === 0) {
      emptyLineCount += 1
    }
    if (k - emptyLineCount >= (complexity === "simple" ? 6 : 12)) {
      lineArray[k] = line.replace(/\s*\S+\s+(\S)/, "$1")
    }
  })
  return lineArray.join("\n")
}

export interface LayoutSelectorProp {
  keyboardName: string
  setKeyboardName: Dispatch<SetStateAction<string>>
  keyboardLongName: string
  setKeyboardLongName: Dispatch<SetStateAction<string>>
  setKeyboardLayout: Dispatch<SetStateAction<KeyboardLayout>>
  keyboardKind: KeyboardKind
  setKeyboardKind: Dispatch<SetStateAction<KeyboardKind>>
  hasLSGT: HasLSGT
  setHasLSGT: Dispatch<SetStateAction<HasLSGT>>
  hasNavigationPad: HasNavigationPad
  setHasNavigationPad: Dispatch<SetStateAction<HasNavigationPad>>
  hasNumpad: HasNumpad
  setHasNumpad: Dispatch<SetStateAction<HasNumpad>>
}

export function LayoutSelector(prop: LayoutSelectorProp) {
  let {
    setKeyboardLayout,
    keyboardKind,
    setKeyboardKind,
    keyboardName,
    setKeyboardName,
    keyboardLongName,
    setKeyboardLongName,
    hasLSGT,
    setHasLSGT,
  } = prop

  let [keyboardText, setKeyboardText] = useState("")
  let [keyboardComplexity, setKeyboardComplexity] =
    useState<Complexity>("simple")
  let [keyboardSelectValue, setKeyboardSelectValue] = useState("other")

  let handleKeyboardSelectValue = (value: string) => {
    const preset = layoutPresets.find((layout) => layout.value === value)
    setKeyboardSelectValue(preset?.value ?? "other")
    if (!preset) return

    const removeExtraKey =
      keyboardKind === "TypeMatrix" && preset.hasLSGT === "LSGT"
    const text = removeExtraKey
      ? removeLSGT(preset.text, preset.complexity)
      : preset.text

    setKeyboardName(preset.name)
    setKeyboardLongName(preset.longName)
    setKeyboardComplexity(preset.complexity)
    setHasLSGT(removeExtraKey ? "noLSGT" : preset.hasLSGT)
    setKeyboardText(text)
    setKeyboardLayout({
      complexity: preset.complexity,
      characterTable: parseKeyboardText(text, preset.complexity),
    })
  }

  useEffect(() => {
    const storedState = loadStoredLayoutState()
    if (storedState) {
      setKeyboardText(storedState.keyboardText)
      setKeyboardComplexity(storedState.keyboardComplexity)
      setKeyboardSelectValue(
        layoutPresets.some(
          (layout) => layout.value === storedState.keyboardSelectValue,
        )
          ? storedState.keyboardSelectValue
          : "other",
      )
      setKeyboardLayout({
        complexity: storedState.keyboardComplexity,
        characterTable: parseKeyboardText(
          storedState.keyboardText,
          storedState.keyboardComplexity,
        ),
      })
      return
    }
    handleKeyboardSelectValue(
      layoutPresets.find((layout) => layout.value === "Qwerty")?.value ??
        layoutPresets[0]?.value ??
        "other",
    )
  }, [])

  useEffect(() => {
    const payload: StoredLayoutState = {
      version: 1,
      keyboardText,
      keyboardComplexity,
      keyboardSelectValue,
    }
    try {
      localStorage.setItem(layoutStorageKey, JSON.stringify(payload))
    } catch {
      // Ignore storage errors silently.
    }
  }, [keyboardText, keyboardComplexity, keyboardSelectValue])

  return (
    <>
      <div className="mt-6">Keyboard Layout</div>
      <div className="flex flex-wrap gap-2">
        <Select
          onChange={handleKeyboardSelectValue}
          value={keyboardSelectValue}
          className="w-[150px]"
          options={[
            { value: "other" },
            ...layoutPresets.map((layout) => ({ value: layout.value })),
          ]}
        />
        <Select
          onChange={(complexity: Complexity) => {
            setKeyboardComplexity(complexity)
            setKeyboardSelectValue("other")
          }}
          value={keyboardComplexity}
          className="w-[400px]"
          options={[
            {
              label: "simple (upper and lower: groups of two lines)",
              value: "simple",
            },
            {
              label:
                "complex (upper, lower and alt.groups: groups of four lines)",
              value: "complex",
            },
          ]}
        />
        <HelpTooltip amongInputs className="ml-0 mr-1">
          <p>
            Choose "simple" if your layout only has different characters for
            upper and lower cases, and "complex" if it also has different
            characters for AltGr or similar modifier keys.
          </p>

          <p>
            The complexity setting affects how the keyboard text is parsed, but
            does not affect the generated configuration format.
          </p>
        </HelpTooltip>
        <Select
          onChange={(name: KeyboardKind) => {
            setKeyboardKind(name)
            if (name === "TypeMatrix") {
              if (hasLSGT === "LSGT") {
                let newText = removeLSGT(keyboardText, keyboardComplexity)
                setKeyboardText(newText)
                setKeyboardLayout({
                  complexity: keyboardComplexity,
                  characterTable: parseKeyboardText(
                    newText,
                    keyboardComplexity,
                  ),
                })
              }
              setHasLSGT("noLSGT")
            }
          }}
          value={keyboardKind}
          className="w-[110px]"
          options={[{ value: "Basic" }, { value: "TypeMatrix" }]}
        />
      </div>
      <div className="mt-2">
        <Checkbox
          checked={hasLSGT === "LSGT"}
          disabled={keyboardKind === "TypeMatrix"}
          onChange={(ev) => {
            setHasLSGT(ev.target.checked ? "LSGT" : "noLSGT")
          }}
        >
          Has LSGT key
        </Checkbox>
        <HelpTooltip>
          This checkbox controls the presence of the "LSGT" (less/greater) key,
          which is located between the left Shift and Z keys on many European
          keyboards. When checked, the parser will expect an additional key in
          the leftmost position of the bottom row.
        </HelpTooltip>
      </div>
      <div className="mt-2">
        <Input.TextArea
          value={keyboardText}
          onChange={(ev) => {
            let text = ev.currentTarget.value
            setKeyboardText(text)
            setKeyboardSelectValue("other")
            setKeyboardLayout({
              complexity: keyboardComplexity,
              characterTable: parseKeyboardText(text, keyboardComplexity),
            })
          }}
          autoSize={{
            minRows: 8,
            maxRows: 20,
          }}
          className="font-mono"
        />
      </div>
    </>
  )
}
