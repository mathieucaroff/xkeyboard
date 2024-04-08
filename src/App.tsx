import React, { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { KeyboardKind, KeyboardLayout } from "./type"
import { Input } from "antd"

export function App() {
  let [keyboardName, setKeyboardName] = useState("")
  let [keyboardGroupName, setKeyboardGroupName] = useState("")
  let [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => ({
    complexity: "simple",
    characterTable: [],
  }))
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
          setKeyboardLayout,
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
          layout: keyboardLayout,
          hasNavigationPad,
          hasNumpad,
        }}
      />
    </>
  )
}
