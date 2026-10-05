import { ConfigurationTemplate } from "../components/ConfigurationTemplate"
import { generateLinuxLoadkeysConfiguration } from "./LinuxLoadkeysTable"

export interface LinuxLoadkeysConfigurationProps {
  keyboard: Keyboard
}

export function LinuxLoadkeysConfiguration({
  keyboard,
}: LinuxLoadkeysConfigurationProps) {
  const result = generateLinuxLoadkeysConfiguration(keyboard)
  const filename = `${keyboard.defaultedName}.map`
  const quotedFilename = `'./${filename.replaceAll("'", "'\\''")}'`
  const commands = `# Back up the current console keymap before making changes.
sudo dumpkeys > console-backup.map

# Check the US baseline and overlay syntax without changing the keyboard.
loadkeys --parse us ${quotedFilename}

# On a Linux virtual console, enable Unicode keyboard input.
sudo kbd_mode -u

# Load the US baseline, then apply this layout's printable-key overlay.
sudo loadkeys us ${quotedFilename}

# Restore the previous console keymap if needed.
sudo loadkeys ./console-backup.map

# Inspect physical keycodes on the console (exit by waiting ten seconds).
sudo showkey --keycodes`

  return (
    <ConfigurationTemplate
      title="Linux Console, loadkeys Configuration"
      defaultedKeyboardName={keyboard.defaultedName}
      fileExtension="map"
      keyboardConfigText={result.text}
      exportDisabled={result.errors.length > 0}
      warning={
        <>
          <p>
            This overlay requires the kbd tools and a US baseline map. It
            affects all Linux virtual consoles, including login prompts, not
            X11, Wayland, terminal emulators, or SSH sessions. Back up the
            current map and keep a recovery session available before loading it.
          </p>
          <p>
            Unicode characters require Unicode console mode and a suitable font.
            Ctrl combinations use ASCII control codes; Meta combinations support
            ASCII only. Unsupported combinations produce no output. Accents are
            literal, not dead keys. For boot-time persistence, load the baseline
            before the overlay using your distribution's console configuration.
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
    >
      <pre className="m-0 whitespace-pre-wrap break-words">{commands}</pre>
    </ConfigurationTemplate>
  )
}
