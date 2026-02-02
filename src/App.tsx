import { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { MacOSConfiguration } from "./components/MacOSConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { Input, Tabs } from "antd"
import { KeyboardView } from "./components/KeyboardView"
import { WindowsConfiguration } from "components/WindowsConfiguration"

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
    longName: keyboardLongName,
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
      <Tabs
        className="os-tabs"
        type="card"
        items={[
          {
            key: "linux",
            label: "Linux",
            children: (
              <>
                <h3>Linux X11 Configuration</h3>
                <XConfiguration keyboard={keyboard} />
              </>
            ),
          },
          {
            key: "macos",
            label: "MacOS",
            children: (
              <>
                <h3>MacOS Configuration</h3>
                <MacOSConfiguration keyboard={keyboard} />
              </>
            ),
          },
          {
            key: "windows",
            label: "Windows",
            children: (
              <>
                <h3>Windows Configuration</h3>
                <WindowsConfiguration keyboard={keyboard} />
              </>
            ),
          },
        ]}
      />
    </>
  )
}
