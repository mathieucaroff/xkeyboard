import React, { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { KeyboardKind } from "./type"
import { Input } from "antd"

export function parseKeyboardText(text: string) {
  return text.split("\n").map((line) => {
    let splitLine = line.split(/\s+/g)
    if (splitLine[0] === "") {
      splitLine.shift()
    }
    return splitLine
  })
}

export function App() {
  let [keyboardName, setKeyboardName] = useState("")
  let [keyboardGroupName, setKeyboardGroupName] = useState("")
  let [keyboardText, setKeyboardText] = useState("")
  let [keyboardKind, setKeyboardKind] = useState<KeyboardKind>("Basic")
  let [hasNavigationPad, setHasNavigationPad] = useState(false)
  let [hasNumpad, setHasNumpad] = useState(false)

  return (
    <>
      <div>Keyboard name</div>
      <Input
        value={keyboardName}
        onChange={(ev) => {
          setKeyboardName(ev.currentTarget.value)
        }}
        style={{
          width: 300,
        }}
      />
      <div>Group name</div>
      <Input
        value={keyboardGroupName}
        onChange={(ev) => {
          setKeyboardGroupName(ev.currentTarget.value)
        }}
        style={{
          width: 300,
        }}
      />
      <LayoutSelector
        {...{
          keyboardText,
          setKeyboardText,
          keyboardKind,
          setKeyboardKind,
          hasNavigationPad,
          setHasNavigationPad,
          hasNumpad,
          setHasNumpad,
        }}
      />
      <XConfiguration
        keyboard={{
          kind: keyboardKind,
          name: keyboardName,
          groupName: keyboardGroupName,
          layout: {
            complexity: "simple",
            characterTable: parseKeyboardText(keyboardText),
          },
          hasNavigationPad,
          hasNumpad,
        }}
      />
    </>
  )
}
