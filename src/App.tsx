import { Button, ConfigProvider, Input, Tabs, theme } from "antd"
import { useEffect, useState } from "react"
import { HelpTooltip } from "./components/HelpTooltip"
import { KeyboardView } from "./components/KeyboardView"
import { LayoutSelector } from "./components/LayoutSelector"
import { LinuxConfiguration } from "./configuration/LinuxConfiguration"
import { MacOSConfiguration } from "./configuration/MacOSConfiguration"
import { WindowsConfiguration } from "./configuration/WindowsConfiguration"
import { MoonIcon, SunIcon } from "./icon/ThemeIcons"

export const KEYBOARD_DEFAULT_NAME = "layout"
export const KEYBOARD_DEFAULT_LONG_NAME = "Custom Keyboard Layout"

const layoutNameHelp = `The layout name is used in the system and as the filename for the generated configuration files. It should only contain letters, digits, underscores, or hyphens, and should not include file extensions. If left empty, it will default to "${KEYBOARD_DEFAULT_NAME}".`
const longLayoutNameHelp = `The long layout name is used as the display name for the keyboard layout. It can contain any characters. If left empty, it will default to "${KEYBOARD_DEFAULT_LONG_NAME}".`

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
        token: {
          colorPrimary: "#fa8c16",
          colorPrimaryHover: "#ff9c2a",
          colorPrimaryActive: "#d46b08",
        },
      }}
    >
      <Button
        size="large"
        className="theme-toggle-button"
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
      <div className="mt-4">
        Layout name
        <HelpTooltip children={layoutNameHelp} />
      </div>
      <Input
        value={keyboardName}
        onChange={(ev) => {
          setKeyboardName(ev.currentTarget.value)
        }}
        className="w-[300px]"
        placeholder={KEYBOARD_DEFAULT_NAME}
      />
      <div className="mt-4">
        Long layout name
        <HelpTooltip children={longLayoutNameHelp} />
      </div>
      <Input
        value={keyboardLongName}
        onChange={(ev) => {
          setKeyboardLongName(ev.currentTarget.value)
        }}
        className="w-[300px]"
        placeholder={KEYBOARD_DEFAULT_LONG_NAME}
      />
      <Tabs
        className="os-tabs mt-6"
        type="card"
        tabBarGutter={5}
        items={configurationTabs}
      />
    </ConfigProvider>
  )
}
