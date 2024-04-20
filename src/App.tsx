import React, { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { Keyboard, KeyboardKind, KeyboardLayout } from "./type"
import { Input } from "antd"
import { KeyboardView } from "./components/KeyboardView"

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

  let keyboard: Keyboard = {
    kind: keyboardKind,
    name: keyboardName,
    groupName: keyboardGroupName,
    layout: keyboardLayout,
    hasNavigationPad,
    hasNumpad,
  }

  return (
    <>
      <div className="title">Keyboard name</div>
      <Input
        value={keyboardName}
        onChange={(ev) => {
          setKeyboardName(ev.currentTarget.value)
        }}
        style={{
          width: 300,
        }}
      />
      <div className="title">Useful commands:</div>
      <ul className="useful-command-list">
        <li>
          <pre>vim /usr/share/X11/xkb/symbols/us</pre>
        </li>
        <li>
          <pre>setxkbmap -print -verbose 10</pre>
        </li>
        <li>
          <pre>{`setxkbmap us ${keyboardName}`}</pre>
        </li>
        <li>
          <pre>{`gsettings set org.gnome.desktop.input-sources sources "[('xkb', 'us+${keyboardName}')]"`}</pre>
        </li>
      </ul>
      <div className="title">Group name</div>
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
      <KeyboardView keyboard={keyboard} />
      <XConfiguration keyboard={keyboard} />
    </>
  )
}
