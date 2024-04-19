import React, { Dispatch, SetStateAction, useState } from "react"
import { Complexity, KeyboardKind, KeyboardLayout } from "../type"
import { Input, Select } from "antd"

const QWERTY = [
  `
~ ! @ # $ % ^ & * ( ) _ +
\` 1 2 3 4 5 6 7 8 9 0 - =
Q W E R T Y U I O P { } |
q w e r t y u i o p [ ] \\
A S D F G H J K L : "
a s d f g h j k l ; '
| Z X C V B N M < > ?
\\ z x c v b n m , . /
`.slice(1, -1),
  "simple",
] as const
const AZERTY = [
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
] as const
const ASSET2018 = [
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
] as const
const AZERTYFULL = [
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
] as const
const ASSET2018FULL = [
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
] as const

function parseKeyboardText(text: string) {
  return text
    .replace(/\n+/g, "\n")
    .split("\n")
    .map((line) => {
      let splitLine = line.split(/\s+/g)
      if (splitLine[0] === "") {
        splitLine.shift()
      }
      return splitLine
    })
}

export interface LayoutSelectorProp {
  setKeyboardLayout: Dispatch<SetStateAction<KeyboardLayout>>
  keyboardKind: KeyboardKind
  setKeyboardKind: Dispatch<SetStateAction<KeyboardKind>>
  hasNavigationPad: boolean
  setHasNavigationPad: Dispatch<SetStateAction<boolean>>
  hasNumpad: boolean
  setHasNumpad: Dispatch<SetStateAction<boolean>>
}

export function LayoutSelector(prop: LayoutSelectorProp) {
  let { setKeyboardLayout, keyboardKind, setKeyboardKind } = prop

  let [keyboardText, setKeyboardText] = useState("")
  let [keyboardComplexity, setKeyboardComplexity] =
    useState<Complexity>("simple")
  let [keyboardSelectValue, setKeyboardSelectValue] = useState("other")

  return (
    <>
      <div>Keyboard Layout</div>
      <div>
        <Select
          onChange={(value) => {
            setKeyboardSelectValue(value)

            let name = value.toUpperCase()
            let [text, complexity] = ({
              QWERTY,
              AZERTY,
              AZERTYFULL,
              ASSET2018,
              ASSET2018FULL,
              OTHER: [keyboardText, keyboardComplexity],
            }[name] ?? ["", "simple"]) as [string, Complexity]
            setKeyboardText(text)
            setKeyboardComplexity(complexity)
            setKeyboardLayout({
              complexity,
              characterTable: parseKeyboardText(text),
            })
          }}
          value={keyboardSelectValue}
          style={{ width: 200 }}
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
          style={{ width: 300 }}
          options={[
            { label: "simple (groups of two lines)", value: "simple" },
            { label: "complex (groups of four lines)", value: "complex" },
          ]}
        />
        <Select
          onChange={(name: KeyboardKind) => {
            setKeyboardKind(name)
          }}
          value={keyboardKind}
          style={{ width: 200 }}
          options={[{ value: "Basic" }, { value: "TypeMatrix" }]}
        />
      </div>
      <div>
        <Input.TextArea
          value={keyboardText}
          onChange={(ev) => {
            setKeyboardText(ev.currentTarget.value)
            setKeyboardSelectValue("other")
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
