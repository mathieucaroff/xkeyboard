import React, { Dispatch, SetStateAction, useState } from "react"
import { KeyboardKind } from "../type"
import { Input, Select } from "antd"
import { DefaultOptionType } from "antd/es/select"

const QWERTY = `
~ ! @ # $ % ^ & * ( ) _ +
\` 1 2 3 4 5 6 7 8 9 0 - =
Q W E R T Y U I O P { } |
q w e r t y u i o p [ ] \\
A S D F G H J K L : "
a s d f g h j k l ; '
| Z X C V B N M < > ?
\\ z x c v b n m , . /
`.slice(1, -1)
const AZERTY = `
  1 2 3 4 5 6 7 8 9 0 ° +
² & é " ' ( - è _ ç à ) =
A Z E R T Y U I O P ¨ £ µ
a z e r t y u i o p ^ $ *
Q S D F G H J K L M %
q s d f g h j k l m ù
> W X C V B N ? . / §
< w x c v b n , ; : !
`.slice(1, -1)
const ASSET2018 = `
~ 1 2 3 4 5 6 7 8 9 0 _ +
\` ! @ # $ % ^ & * ( ) - =
Q W D G J Y P U L : { } |
q w d g j y p u l ; [ ] \\
A S E T F H N I O R "
a s e t f h n i o r '
- Z X C V B K M < > ?
_ z x c v b k m , . /
`.slice(1, -1)
const ASSET2018FULL = `
~ 1 2 3 4 5 6 7 8 9 0 _ +
\` ! @ # $ % ^ & * ( ) - =
³ Ä Œ Ë . ‱ . Ü Ï Ö . . §
² ä œ ë £ ‰ . ü ï ö . ° ¤
Q W D G J Y P U L : { } |
q w d g j y p u l ; [ ] \\
À Ñ È . . . Ù Ì Ò . 
à ñ è . . . ù ì ò . ⟨ ⟩
A S E T F H N I O R "
a s e t f h n i o r '
Á ß É € . ― Ú Í Ó . ⸮
á ß é € . ― ú í ó . ¿
- Z X C V B K M < > ?
_ z x c v b k m , . /
— Â Ç Ê . . . Û Î Ô .
– â ç ê . . . û î ô .
`.slice(1, -1)

export interface LayoutSelectorProp {
  keyboardText: string
  setKeyboardText: Dispatch<SetStateAction<string>>
  keyboardKind: KeyboardKind
  setKeyboardKind: Dispatch<SetStateAction<KeyboardKind>>
  hasNavigationPad: boolean
  setHasNavigationPad: Dispatch<SetStateAction<boolean>>
  hasNumpad: boolean
  setHasNumpad: Dispatch<SetStateAction<boolean>>
}

export function LayoutSelector(prop: LayoutSelectorProp) {
  let { keyboardText, setKeyboardText, keyboardKind, setKeyboardKind } = prop

  let [keyboardLayout, setKeyboardLayout] = useState("other")

  return (
    <>
      <div>Keyboard Layout</div>
      <div>
        <Select
          onChange={(value) => {
            setKeyboardLayout(value)

            let name = value.toUpperCase()
            setKeyboardText(
              {
                QWERTY,
                AZERTY,
                ASSET2018,
                ASSET2018FULL,
                OTHER: keyboardText,
              }[name] ?? "",
            )
          }}
          value={keyboardLayout}
          style={{ width: 200 }}
          options={[
            { value: "other" },
            { value: "Qwerty" },
            { value: "Azerty" },
            { value: "Asset2018" },
            { value: "Asset2018Full" },
          ]}
        ></Select>
        <Select
          onChange={(name: KeyboardKind) => {
            setKeyboardKind(name)
          }}
          value={keyboardKind}
          style={{ width: 200 }}
        >
          <option>Basic</option>
          <option>TypeMatrix</option>
        </Select>
      </div>
      <div>
        <Input.TextArea
          value={keyboardText}
          onChange={(ev) => {
            setKeyboardText(ev.currentTarget.value)
            setKeyboardLayout("other")
          }}
          autoSize={{
            minRows: 8,
            maxRows: 16,
          }}
          style={{
            fontFamily: "monospace",
          }}
        />
      </div>
    </>
  )
}
