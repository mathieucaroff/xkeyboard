import { useState } from "react"
import { XConfiguration } from "./components/XConfiguration"
import { MacOSConfiguration } from "./components/MacOSConfiguration"
import { LayoutSelector } from "./components/LayoutSelector"
import { Collapse, Input } from "antd"
import { KeyboardView } from "./components/KeyboardView"

const CollapsePanel = Collapse.Panel

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
      <Collapse defaultActiveKey={["Linux"]} accordion>
        <CollapsePanel header="Linux X11 Configuration" key="Linux">
          <XConfiguration keyboard={keyboard} />
        </CollapsePanel>
        <CollapsePanel header="MacOS Configuration" key="MacOS">
          <MacOSConfiguration keyboard={keyboard} />
        </CollapsePanel>
      </Collapse>
    </>
  )
}
