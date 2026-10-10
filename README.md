# XKeyboard

XKeyboard is a web keyboard layout descriptor for X11 / Wayland, Linux virtual
consoles, MacOS, MSKLC for Windows and Android physical keyboards. The keyboard layout is defined by a simple
enumeration of the keys of the keyboard. XKeyboard generates XKB symbol files,
Linux loadkeys .map overlays, KeyLayout XML for MacOS, MSKLC .klc files for Windows
and Android .kcm layout-provider overlays.

XKeyboard is accessible at:

- https://xkeyboard.ea9c.com/
- https://xkeyboard.vercel.app/

XKeyboard is Open Source and is JAM licensed.

![XKeyboard screenshot](./asset/img/screenshot.png)

## Linux loadkeys

The Linux loadkeys tab exports a UTF-8, LF-terminated `.map` overlay for the Linux
virtual console. It does not configure X11, Wayland, terminal emulators or SSH.
Install your distribution's `kbd` tools and make the `us` console keymap available.
The overlay changes printable keys; the US baseline supplies Space, Enter,
modifiers, function keys, navigation and keypad behavior.

Run these commands from a Linux virtual console, replacing `layout.map` with the
downloaded filename. Keep a recovery session available: loading a map affects all
virtual consoles and login prompts, and lasts beyond the current login session.

```sh
# Back up the current console keymap before making changes.
sudo dumpkeys > console-backup.map

# Validate the baseline and overlay without changing any keyboard bindings.
loadkeys --parse us ./layout.map

# Enable Unicode keyboard input on the current virtual console.
sudo kbd_mode -u

# Load the US baseline and then apply the custom printable-key overlay.
sudo loadkeys us ./layout.map

# Restore the backed-up keyboard bindings if needed.
sudo loadkeys ./console-backup.map

# Inspect hardware keycodes; showkey exits after ten seconds without input.
sudo showkey --keycodes
```

Restoring the keymap does not restore the previous keyboard mode. Check the mode
with `kbd_mode` before changing it. Unicode output also needs an appropriate
console font; a valid mapping does not guarantee that every glyph can be displayed.

Simple layouts repeat plain/Shift on the AltGr levels. Complex layouts use all
four supplied levels and bind right Alt to AltGr. Empty complex levels emit
`VoidSymbol`. Ctrl combinations use conventional ASCII control codes derived
from the assigned character, and Alt/Meta output supports ASCII only; unsupported
combinations produce no output. Caps Lock supports ASCII and Latin-1 case pairs,
but not arbitrary Unicode case pairs. Accents are literal characters, not dead
keys, and the overlay does not add compose definitions.

Each populated entry must be one printable Unicode scalar below U+F000, excluding
surrogates and control characters. Multi-character entries, supplementary-plane
characters, unsupported physical positions and duplicate keycodes block export.
TypeMatrix uses the same standard PC keycodes as the other exporters; verify
them on your hardware with `showkey --keycodes`.

Boot-time installation is distribution-specific. Arrange for the baseline to
load before the overlay; this file is not a complete standalone `KEYMAP`.

## Android KCM

The Android KCM tab exports a UTF-8, LF-terminated `.kcm` with `type OVERLAY`
for a physical-keyboard layout-provider APK. It is not an on-screen keyboard,
an IME, or a standalone device character map. Layout-provider selection is
available on Android 4.1 and later; test on the Android releases you intend to
support. No root access is needed to install a normal layout-provider APK.

The overlay assumes standard PC / `Generic.kl` Android key bindings. Key names
refer to physical US positions, not assigned characters: the Q position remains
`key Q` even when it produces `a`. Device-specific key layouts can differ.
TypeMatrix uses the same PC assumptions and should be checked on real hardware.
ISO's extra key is mapped from Linux scan code 86 to Android `RO`, keeping it
distinct from `BACKSLASH`. This is not intended for JIS hardware with a separate
RO key. Duplicate backslash positions and unsupported rows/columns block export.

Simple layouts repeat plain/Shift on right Alt. Complex layouts use plain,
Shift, right Alt and Shift+right Alt. Empty levels explicitly type nothing.
Caps Lock swaps single-character case pairs, and Shift+Caps Lock restores the
base character, independently on both level pairs. Other pairs, including
punctuation, are unchanged. Ctrl, left Alt and Meta do not produce text;
applications still receive key events, but shortcuts may use physical key codes
rather than the assigned characters. IMEs and applications may intercept input.

Display labels use the shifted character for case pairs, otherwise the first
nonempty level. Numeric metadata uses the first ASCII digit across the supplied
levels, otherwise the first numeric punctuation character from `()#*-+,.'/:;`.
No US digit is invented for a reassigned key. Android may infer numeric metadata
when none is supplied. Keys absent from the grid retain baseline behavior,
including Space, Enter, modifiers, function keys, navigation and keypad bindings.
Each emitted key replaces its entire baseline definition.

Each nonempty level must be one printable BMP character, excluding surrogates,
control characters, combining marks and Android's reserved U+EF00/U+EF01 actions.
Supplementary-plane characters and multi-character sequences are unsupported by
KCM character literals. Combining marks are rejected to avoid implicit Android
dead-key behavior; spacing accents such as a literal circumflex remain literal.
Non-ASCII output is serialized as `\uXXXX`, not a raw Unicode literal.

### Packaging and activation

Use an ordinary Android application project with the Android SDK and Gradle.
Place the exported file in `app/src/main/res/raw/custom_layout.kcm`, using this
fixed lowercase resource filename regardless of the download's name. Add
`app/src/main/res/xml/keyboard_layouts.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<keyboard-layouts xmlns:android="http://schemas.android.com/apk/res/android">
	<keyboard-layout
		android:name="custom_layout"
		android:label="Custom Keyboard Layout"
		android:keyboardLayout="@raw/custom_layout" />
</keyboard-layouts>
```

Replace the display label as needed, XML-escaping special characters. Register
a receiver inside the application's manifest `<application>` element:

```xml
<receiver
	android:name=".KeyboardLayoutReceiver"
	android:label="Custom Keyboard Layout"
	android:exported="true">
	<intent-filter>
		<action android:name="android.hardware.input.action.QUERY_KEYBOARD_LAYOUTS" />
	</intent-filter>
	<meta-data
		android:name="android.hardware.input.metadata.KEYBOARD_LAYOUTS"
		android:resource="@xml/keyboard_layouts" />
</receiver>
```

Provide the receiver class under the app's namespace, for example in
`app/src/main/java/com/example/keyboardlayout/KeyboardLayoutReceiver.java`:

```java
package com.example.keyboardlayout;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class KeyboardLayoutReceiver extends BroadcastReceiver {
	@Override
	public void onReceive(Context context, Intent intent) {}
}
```

Use your project's actual namespace in place of `com.example.keyboardlayout`.
No system UID or privileged permissions are required. Build the APK with
`./gradlew assembleDebug` (Windows: `.\gradlew.bat assembleDebug`), then install
it with `adb install -r app/build/outputs/apk/debug/app-debug.apk`. Connect the
physical keyboard and select the layout in Android's physical keyboard settings;
the settings path varies by release and vendor. To recover, select a built-in
layout or uninstall the provider APK. XKeyboard does not generate or sign APKs.

Validate the exported file with an AOSP host build of `validatekeymaps`:

```sh
validatekeymaps ./layout.kcm
```

This is an AOSP development tool, not a standard Android SDK command. Syntax
validation does not prove hardware mapping or typing behavior. Verify plain,
Shift, Caps Lock, Shift+Caps Lock, right Alt, empty levels, shortcuts, both ISO
keys, and unchanged navigation/keypad behavior on the target device. Do not use
`adb shell input text` as a physical-keyboard test; it uses injected input.

Do not install this `OVERLAY` as a standalone `keyboard.characterMap` in an IDC
file or overwrite `Generic.kcm` / `Virtual.kcm`. Standalone device maps require
`type FULL` and complete standard-key definitions, plus privileged device-specific
installation, filename/IDC association, lookup precedence, SELinux handling and
a recovery procedure. That export mode is not provided.

References: [KCM format](https://source.android.com/docs/core/interaction/input/key-character-map-files),
[AOSP overlay example](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/packages/InputDevices/res/raw/keyboard_layout_english_us.kcm),
and [validatekeymaps](https://source.android.com/docs/core/interaction/input/validate-keymaps).

## Development

### Layout presets

Vite imports all `layout/**/*.txt` files as strings. Each file starts with four
metadata lines: configuration name, display name, `simple` or `complex`, and
`LSGT` or `noLSGT`. The remaining lines contain whitespace-separated key symbols.
Simple layouts use groups of two lines (upper, lower); complex layouts use four
(upper, lower, AltGr upper, AltGr lower). Blank separator lines are ignored.
There must be one to five complete groups, with at most 14 key columns per line.
Short modifier rows are padded with empty keys by the keyboard parser.

Each symbol is a single printable Unicode scalar. `.` represents an empty key.
Use `:` as a placeholder and append a matching `:symbol` token to the same line;
for example, `A : ::` represents A followed by a literal colon, and `A : :.`
represents A followed by a literal period. Backticks and backslashes are literal
characters, not JavaScript escapes. UTF-8 BOMs and CRLF line endings are supported.

Valid files appear in the layout selector using their paths relative to `layout/`
without `.txt`. Invalid files are excluded and logged with their paths and
validation errors in the browser console. Qwerty is the default when available;
otherwise the first valid file is used, or the custom editor if none are valid.

### Software development

Install dependencies with `bun install`. Run `bun run dev` for
the application, `bun run build` for a production bundle, `bunx tsc --noEmit` for
type checking, and `bun test` for generator tests. On Linux, also validate
generated maps using `loadkeys --parse`; actual keyboard behavior needs a Linux
virtual console, preferably in a disposable VM.
