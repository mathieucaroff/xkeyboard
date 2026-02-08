import { KeyboardView } from "./components/KeyboardView"
import { LayoutSelector } from "./components/LayoutSelector"
import { LinuxConfiguration } from "./configuration/LinuxConfiguration"
import { MacOSConfiguration } from "./configuration/MacOSConfiguration"
import { WindowsConfiguration } from "./configuration/WindowsConfiguration"
import { MoonIcon, SunIcon } from "./icon/ThemeIcons"
import { Button, ConfigProvider, Input, Tabs, theme } from "antd"
import { useEffect, useState } from "react"

export const KEYBOARD_DEFAULT_NAME = "layout"
export const KEYBOARD_DEFAULT_LONG_NAME = "Custom Keyboard Layout"

export function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme
  let [isDarkMode, setIsDarkMode] = useState(false)
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const iconProps = { className: "h-5 w-5" }
  const themeButtonTitle = isDarkMode
    ? "Switch to light mode"
    : "Switch to dark mode"

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        components: {
          Tabs: {},
        },
      }}
    >
      <Button
        size="large"
        className="keyboard-theme-toggle"
        onClick={() => setIsDarkMode((value) => !value)}
        aria-pressed={isDarkMode}
        aria-label={themeButtonTitle}
        title={themeButtonTitle}
      >
        {isDarkMode ? <SunIcon {...iconProps} /> : <MoonIcon {...iconProps} />}
      </Button>
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
      <KeyboardView className="mt-4" keyboard={keyboard} />
      <div className="mt-4">Layout name</div>
      <Input
        value={keyboardName}
        onChange={(ev) => {
          setKeyboardName(ev.currentTarget.value)
        }}
        className="w-[300px]"
        placeholder={KEYBOARD_DEFAULT_NAME}
      />
      <div className="mt-4">Long layout name</div>
      <Input
        value={keyboardLongName}
        onChange={(ev) => {
          setKeyboardLongName(ev.currentTarget.value)
        }}
        className="w-[300px]"
      />
      <Tabs className="os-tabs mt-6" type="card" items={configurationTabs} />
    </ConfigProvider>
  )
}
