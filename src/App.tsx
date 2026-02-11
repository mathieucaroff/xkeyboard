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

const themeStorageKey = "xkeyboard-theme"
const tabStorageKey = "xkeyboard-config-tab"
const configStorageKey = "xkeyboard-config"

const layoutNameHelp = `The layout name is used in the system and as the filename for the generated configuration files. It should only contain letters, digits, underscores, or hyphens, and should not include file extensions. If left empty, it will default to "${KEYBOARD_DEFAULT_NAME}".`
const longLayoutNameHelp = `The long layout name is used as the display name for the keyboard layout. It can contain any characters. If left empty, it will default to "${KEYBOARD_DEFAULT_LONG_NAME}".`

function ignoreErrors<T>(action: () => T, fallback: T) {
  try {
    return action()
  } catch {
    return fallback
  }
}

type StoredConfig = {
  version: 1
  keyboardName: string
  keyboardLongName: string
  keyboardLayout: KeyboardLayout
  keyboardKind: KeyboardKind
  hasLSGT: HasLSGT
  hasNavigationPad: HasNavigationPad
  hasNumpad: HasNumpad
}

function isStoredConfig(value: unknown): value is StoredConfig {
  if (!value || typeof value !== "object") {
    return false
  }
  const config = value as StoredConfig
  return (
    config.version === 1 &&
    typeof config.keyboardName === "string" &&
    typeof config.keyboardLongName === "string" &&
    config.keyboardLayout !== null &&
    typeof config.keyboardLayout === "object" &&
    (config.keyboardLayout.complexity === "simple" ||
      config.keyboardLayout.complexity === "complex") &&
    Array.isArray(config.keyboardLayout.characterTable) &&
    (config.keyboardKind === "Basic" || config.keyboardKind === "TypeMatrix") &&
    (config.hasLSGT === "LSGT" || config.hasLSGT === "noLSGT") &&
    (config.hasNavigationPad === "NavigationPad" ||
      config.hasNavigationPad === "noNavigationPad") &&
    (config.hasNumpad === "Numpad" || config.hasNumpad === "noNumpad")
  )
}

function loadStoredConfig() {
  return ignoreErrors(() => {
    const raw = localStorage.getItem(configStorageKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as StoredConfig
    return isStoredConfig(parsed) ? parsed : null
  }, null)
}

export function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme
  const configurationOs = ["Linux", "MacOS", "Windows"] as const
  const configurationComponents = {
    Linux: LinuxConfiguration,
    MacOS: MacOSConfiguration,
    Windows: WindowsConfiguration,
  }
  const [storedConfig] = useState(() => loadStoredConfig())
  let [isDarkMode, setIsDarkMode] = useState(() =>
    ignoreErrors(() => localStorage.getItem(themeStorageKey) === "dark", false),
  )
  let [activeConfigTab, setActiveConfigTab] = useState(() =>
    ignoreErrors(() => {
      let stored = localStorage.getItem(tabStorageKey)
      if (
        stored &&
        configurationOs.includes(stored as (typeof configurationOs)[number])
      ) {
        return stored
      }
      return configurationOs[0]
    }, configurationOs[0]),
  )
  let [keyboardName, setKeyboardName] = useState(
    () => storedConfig?.keyboardName ?? "",
  )
  let [keyboardLongName, setKeyboardLongName] = useState(
    () => storedConfig?.keyboardLongName ?? "",
  )
  let [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() =>
    storedConfig?.keyboardLayout
      ? storedConfig.keyboardLayout
      : { complexity: "simple", characterTable: [] },
  )
  let [keyboardKind, setKeyboardKind] = useState<KeyboardKind>(
    () => storedConfig?.keyboardKind ?? "Basic",
  )
  let [hasNavigationPad, setHasNavigationPad] = useState<HasNavigationPad>(
    () => storedConfig?.hasNavigationPad ?? "noNavigationPad",
  )
  let [hasNumpad, setHasNumpad] = useState<HasNumpad>(
    () => storedConfig?.hasNumpad ?? "noNumpad",
  )
  let [hasLSGT, setHasLSGT] = useState<HasLSGT>(
    () => storedConfig?.hasLSGT ?? "noLSGT",
  )

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

  let configurationTabs = configurationOs.map((os) => {
    let Component = configurationComponents[os]
    return { key: os, label: os, children: <Component keyboard={keyboard} /> }
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    ignoreErrors(() => {
      localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light")
    }, undefined)
  }, [isDarkMode])

  useEffect(() => {
    ignoreErrors(() => {
      localStorage.setItem(tabStorageKey, activeConfigTab)
    }, undefined)
  }, [activeConfigTab])

  useEffect(() => {
    const payload: StoredConfig = {
      version: 1,
      keyboardName,
      keyboardLongName,
      keyboardLayout,
      keyboardKind,
      hasLSGT,
      hasNavigationPad,
      hasNumpad,
    }
    ignoreErrors(() => {
      localStorage.setItem(configStorageKey, JSON.stringify(payload))
    }, undefined)
  }, [
    keyboardName,
    keyboardLongName,
    keyboardLayout,
    keyboardKind,
    hasLSGT,
    hasNavigationPad,
    hasNumpad,
  ])

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
        activeKey={activeConfigTab}
        onChange={setActiveConfigTab}
      />
    </ConfigProvider>
  )
}
