import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { generateAndroidKcmConfiguration } from "./AndroidKcmTable"

export interface AndroidKcmConfigurationProps {
  keyboard: Keyboard
}

export function AndroidKcmConfiguration({
  keyboard,
}: AndroidKcmConfigurationProps) {
  const result = generateAndroidKcmConfiguration(keyboard)
  return (
    <ConfigurationTemplate
      title="Android Key Character Map"
      defaultedKeyboardName={keyboard.defaultedName}
      fileExtension="kcm"
      keyboardConfigText={result.text}
      exportDisabled={result.errors.length > 0}
      warning={
        <>
          <p>
            This is a physical-keyboard layout-provider overlay, not an
            on-screen keyboard or a standalone device map. Package it as a raw
            resource in an Android keyboard-layout-provider APK, install the
            APK, and select the layout in the device's physical keyboard
            settings. Downloading the file alone does not install it. Do not
            replace Generic.kcm or Virtual.kcm.
          </p>
          <p>
            Standard PC / Generic.kl key bindings are assumed. Right Alt selects
            the third and fourth levels; simple layouts repeat plain/Shift.
            Empty levels type nothing. Ctrl, left Alt and Meta combinations do
            not generate text; applications still receive key events for
            shortcuts. Space, Enter, navigation and keypad behavior remain with
            the device baseline. IMEs and applications may intercept keys.
          </p>
          <p>
            Only single printable BMP characters are supported. Combining marks,
            supplementary characters and Android's reserved U+EF00/U+EF01
            actions block export. Spacing accents remain literal. Validate the
            file with AOSP's validatekeymaps before installation.
          </p>
          {result.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
          {result.errors.length > 0 ? (
            <div role="alert">
              <strong>Export unavailable:</strong>
              <ul>
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      }
    />
  )
}
