import { useState } from "react"
import { LinuxConfiguration } from "./configuration/LinuxConfiguration"
import { MacOSConfiguration } from "./configuration/MacOSConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { Input, Tabs } from "antd"
import { KeyboardView } from "./components/KeyboardView"
import { WindowsConfiguration } from "./configuration/WindowsConfiguration"

export const KEYBOARD_DEFAULT_NAME = "layout"
export const KEYBOARD_DEFAULT_LONG_NAME = "Custom Keyboard Layout"

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
    defaultedName: keyboardName || KEYBOARD_DEFAULT_NAME,
    longName: keyboardLongName || KEYBOARD_DEFAULT_LONG_NAME,
    layout: keyboardLayout,
    hasLSGT,
    hasNavigationPad,
    hasNumpad,
  }

  const configurationOs = ["Linux", "MacOS", "Windows"] as const
  const configurationComponents = {
    Linux: LinuxConfiguration,
    MacOS: MacOSConfiguration,
    Windows: WindowsConfiguration,
  }
  let configurationTabs = configurationOs.map((os) => {
    let Component = configurationComponents[os]
    return { key: os, label: os, children: <Component keyboard={keyboard} /> }
  })

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
      <div className="mt-6">Layout name</div>
      <Input
        value={keyboardName}
        onChange={(ev) => {
          setKeyboardName(ev.currentTarget.value)
        }}
        className="w-[300px]"
        placeholder={KEYBOARD_DEFAULT_NAME}
      />
      <div className="mt-6">Long layout name</div>
      <Input
        value={keyboardLongName}
        onChange={(ev) => {
          setKeyboardLongName(ev.currentTarget.value)
        }}
        className="w-[300px]"
      />
      <Tabs className="mt-6" type="card" items={configurationTabs} />
    </>
  )
}
