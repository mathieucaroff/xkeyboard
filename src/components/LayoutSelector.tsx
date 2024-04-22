import React, { Dispatch, SetStateAction, useState } from "react"
import {
  Complexity,
  HasLSGT,
  HasNavigationPad,
  HasNumpad,
  KeyboardKind,
  KeyboardLayout,
  Position,
} from "../type"
import { Checkbox, Input, Select } from "antd"
import { text } from "stream/consumers"
import { parse } from "path"

const QWERTY = [
  "qwerty",
  "Qwerty",
  `
~ ! @ # $ % ^ & * ( ) _ +
\` 1 2 3 4 5 6 7 8 9 0 - =
Q W E R T Y U I O P { } |
q w e r t y u i o p [ ] \\
A S D F G H J K L : "
a s d f g h j k l ; '
Z X C V B N M < > ?
z x c v b n m , . /
`.slice(1, -1),
  "simple",
  "noLSGT",
] as const
const AZERTY = [
  "azerty_short",
  "Azerty short",
  `
. 1 2 3 4 5 6 7 8 9 0 ° +
² & é " ' ( - è _ ç à ) =
A Z E R T Y U I O P ¨ £ µ
a z e r t y u i o p ^ $ *
Q S D F G H J K L M %
q s d f g h j k l m ù
> W X C V B N ? . / §
< w x c v b n , ; : !
`.slice(1, -1),
  "simple",
  "LSGT",
] as const
const ASSET2018 = [
  "asset2018_short",
  "Asset 2018 short",
  `
~ 1 2 3 4 5 6 7 8 9 0 _ +
\` ! @ # $ % ^ & * ( ) - =
Q W D G J Y P U L : { } |
q w d g j y p u l ; [ ] \\
A S E T F H N I O R "
a s e t f h n i o r '
- Z X C V B K M < > ?
_ z x c v b k m , . /
`.slice(1, -1),
  "simple",
  "LSGT",
] as const
const AZERTYFULL = [
  "azerty",
  "Azerty",
  `
  1 2 3 4 5 6 7 8 9 0 ° +
² & é " ' ( - è _ ç à ) =
.
. . ~ # { [ | \` \\ ^ @ ] }

A Z E R T Y U I O P ¨ £ µ
a z e r t y u i o p ^ $ *
.
. . € . . . . . . . . ¤

Q S D F G H J K L M %
q s d f g h j k l m ù
.
.

> W X C V B N ? . / §
< w x c v b n , ; : !
.
.
`.slice(1, -1),
  "complex",
  "LSGT",
] as const
const ASSET2018FULL = [
  "asset2018",
  "Asset 2018",
  `
~ 1 2 3 4 5 6 7 8 9 0 _ +
\` ! @ # $ % ^ & * ( ) - =
³ Ä Œ Ë . ‱ . Ü Ï Ö . . §
² ä œ ë £ ‰ . ü ï ö . ° ¤

Q W D G J Y P U L : { } |
q w d g j y p u l ; [ ] \\
À Ñ È . . . Ù Ì Ò
à ñ è . . . ù ì ò . ⟨ ⟩

A S E T F H N I O R "
a s e t f h n i o r '
Á ß É € . ― Ú Í Ó . ⸮
á ß é € . ― ú í ó . ¿

- Z X C V B K M < > ?
_ z x c v b k m , . /
— Â Ç Ê . . . Û Î Ô
– â ç ê . . . û î ô
`.slice(1, -1),
  "complex",
  "LSGT",
] as const

function parseKeyboardText(text: string, complexity: Complexity) {
  let groupSize = complexity === "simple" ? 2 : 4

  let table = text
    .replace(/\n+/g, "\n")
    .split("\n")
    .map((line) => {
      let splitLine = line.split(/\s+/g)
      if (splitLine[0] === "") {
        splitLine.shift()
      }
      return splitLine
    })

  let readCharacterGroup = ({ row, column }: Position) => {
    let group = Array.from(
      { length: groupSize },
      (_, offset) => (table[groupSize * row + offset] ?? [])[column] ?? "",
    )

    if (complexity === "simple") {
      return [group[1], group[0]]
    } else {
      return [group[1], group[0], group[3], group[2]]
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

  return (
    <>
      <div className="title">Keyboard Layout</div>
      <div>
        <Select
          onChange={(value) => {
            setKeyboardSelectValue(value)

            let selection = value.toUpperCase()
            let [name, longName, text, complexity, keyboardHasLSGT] = ({
              QWERTY,
              AZERTY,
              AZERTYFULL,
              ASSET2018,
              ASSET2018FULL,
              OTHER: [
                keyboardName,
                keyboardLongName,
                keyboardText,
                keyboardComplexity,
                keyboardKind,
              ],
            }[selection] ?? ["", "", "", "simple", "LSGT"]) as [
              string,
              string,
              string,
              Complexity,
              HasLSGT,
            ]
            setKeyboardName(name)
            setKeyboardLongName(longName)
            setKeyboardComplexity(complexity)
            if (keyboardKind === "TypeMatrix" && keyboardHasLSGT === "LSGT") {
              text = removeLSGT(text, complexity)
              keyboardHasLSGT = "noLSGT"
            }
            setHasLSGT(keyboardHasLSGT)
            setKeyboardText(text)
            setKeyboardLayout({
              complexity,
              characterTable: parseKeyboardText(text, complexity),
            })
          }}
          value={keyboardSelectValue}
          style={{ width: 150 }}
          options={[
            { value: "other" },
            { value: "Qwerty" },
            { value: "Azerty" },
            { value: "AzertyFull" },
            { value: "Asset2018" },
            { value: "Asset2018Full" },
          ]}
        />
        <Select
          onChange={(complexity: Complexity) => {
            setKeyboardComplexity(complexity)
            setKeyboardSelectValue("other")
          }}
          value={keyboardComplexity}
          style={{ width: 400 }}
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
          style={{ width: 110 }}
          options={[{ value: "Basic" }, { value: "TypeMatrix" }]}
        />
      </div>
      <div>
        <Checkbox
          checked={hasLSGT === "LSGT"}
          disabled={keyboardKind === "TypeMatrix"}
          onChange={(ev) => {
            setHasLSGT(ev.target.checked ? "LSGT" : "noLSGT")
          }}
        >
          Has LSGT key
        </Checkbox>
      </div>
      <div>
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
          style={{
            fontFamily: "monospace",
          }}
        />
      </div>
    </>
  )
}
