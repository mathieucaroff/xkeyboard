import React, { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { Input } from "antd"
import { KeyboardView } from "./components/KeyboardView"

export function App() {
  let [keyboardName, setKeyboardName] = useState("")
  let [keyboardLongName, setKeyboardLongName] = useState("")
  let [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => ({
    complexity: "simple",
    characterTable: [],
  }))
  let [keyboardKind, setKeyboardKind] = useState<KeyboardKind>("Basic")
  let [hasNavigationPad, setHasNavigationPad] =
    useState<HasNavigationPad>("noNavigationPad")
  let [hasNumpad, setHasNumpad] = useState<HasNumpad>("noNumpad")
  let [hasLSGT, setHasLSGT] = useState<HasLSGT>("noLSGT")

  let keyboard: Keyboard = {
    kind: keyboardKind,
    name: keyboardName,
    groupName: keyboardLongName,
    layout: keyboardLayout,
    hasLSGT,
    hasNavigationPad,
    hasNumpad,
  }

  return (
    <>
      <LayoutSelector
        {...{
          setKeyboardLayout,
          keyboardName,
          setKeyboardName,
          keyboardLongName,
          setKeyboardLongName,
          keyboardKind,
          setKeyboardKind,
          hasLSGT,
          setHasLSGT,
          hasNavigationPad,
          setHasNavigationPad,
          hasNumpad,
          setHasNumpad,
        }}
      />
      <KeyboardView keyboard={keyboard} />
      <div className="title">Layout name</div>
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
      <div className="title">Long layout name</div>
      <Input
        value={keyboardLongName}
        onChange={(ev) => {
          setKeyboardLongName(ev.currentTarget.value)
        }}
        style={{
          width: 300,
        }}
      />
      <XConfiguration keyboard={keyboard} />
    </>
  )
}
