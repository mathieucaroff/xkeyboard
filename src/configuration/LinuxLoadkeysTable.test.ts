import { expect, test } from "bun:test"
import {
  generateLinuxLoadkeysConfiguration,
  getLinuxLoadkeysKeyCode,
  getLinuxLoadkeysSymbol,
} from "./LinuxLoadkeysTable"

function keyActions(text: string, keycode: number) {
  const match = text.match(new RegExp(`^keycode ${keycode} = (.+)$`, "m"))
  expect(match).not.toBeNull()
  const actions = match![1]!.split(" ")
  return Array.from(
    { length: 16 },
    (_, mapIndex) => actions[mapIndex] ?? "VoidSymbol",
  )
}

function keyboard(
  characterTable: string[][][],
  complexity = "simple",
  hasLSGT = "noLSGT",
) {
  return {
    kind: "Basic",
    name: "test",
    defaultedName: "test",
    longName: "Test layout",
    layout: { complexity, characterTable },
    hasLSGT,
    hasNavigationPad: "noNavigationPad",
    hasNumpad: "noNumpad",
  } as Keyboard
}

test("maps ANSI, ISO, backslash and unknown physical positions", () => {
  for (const [row, column, expected] of [
    [0, 0, 41],
    [0, 1, 2],
    [0, 12, 13],
    [1, 0, 16],
    [1, 12, 43],
    [2, 0, 30],
    [2, 11, 43],
    [3, 0, 44],
    [3, 9, 53],
    [4, 0, null],
  ]) {
    expect(
      getLinuxLoadkeysKeyCode({ row: row!, column: column! }, "noLSGT"),
    ).toBe(expected)
  }
  expect(getLinuxLoadkeysKeyCode({ row: 3, column: 0 }, "LSGT")).toBe(86)
  expect(getLinuxLoadkeysKeyCode({ row: 3, column: 1 }, "LSGT")).toBe(44)
  expect(getLinuxLoadkeysKeyCode({ row: 3, column: 10 }, "LSGT")).toBe(53)
})

test("serializes punctuation, digits, Unicode and empty levels safely", () => {
  expect(getLinuxLoadkeysSymbol("1")).toBe("one")
  expect(getLinuxLoadkeysSymbol("#")).toBe("numbersign")
  expect(getLinuxLoadkeysSymbol("\\")).toBe("backslash")
  expect(getLinuxLoadkeysSymbol("€")).toBe("U+20AC")
  expect(getLinuxLoadkeysSymbol("")).toBe("VoidSymbol")
  for (const invalid of [
    "ab",
    "e\u0301",
    "\uD800",
    "\uF000",
    "\uFFFF",
    "\u{1F600}",
    "\n",
    "\u007f",
  ]) {
    expect(() => getLinuxLoadkeysSymbol(invalid)).toThrow()
  }
})

test("simple maps repeat plain/Shift with AltGr and remap Ctrl/Meta", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([[], [["c", "C"]]]),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^keymaps 0-15$/m)
  expect(keyActions(result.text, 16)).toEqual([
    "+c",
    "+C",
    "+c",
    "+C",
    "Control_c",
    "Control_c",
    "Control_c",
    "Control_c",
    "Meta_c",
    "Meta_C",
    "Meta_c",
    "Meta_C",
    "Meta_Control_c",
    "Meta_Control_c",
    "Meta_Control_c",
    "Meta_Control_c",
  ])
  expect(result.text).not.toMatch(/^include|^keycode (14|15|28|57|59|102) =/m)
})

test("complex maps preserve four levels and bind right Alt in every map", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([[["é", "É", "€", ""]]], "complex"),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^keycode 41 = \+U\+00E9 \+U\+00C9 U\+20AC$/m)
  expect(keyActions(result.text, 41).slice(3)).toEqual(
    Array(13).fill("VoidSymbol"),
  )
  expect(result.text.match(/^keycode 100 = AltGr$/gm)).toHaveLength(1)
})

test("uses canonical console symbols for Ctrl punctuation and Meta controls", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([
      [
        ["2", "@"],
        ["[", "{"],
        ["?", "/"],
      ],
    ]),
  )
  expect(result.errors).toEqual([])
  expect(keyActions(result.text, 41)[4]).toBe("nul")
  expect(keyActions(result.text, 41)[5]).toBe("nul")
  expect(keyActions(result.text, 41)[12]).toBe("Meta_nul")
  expect(keyActions(result.text, 2)[4]).toBe("Escape")
  expect(keyActions(result.text, 3)[4]).toBe("Delete")
  expect(keyActions(result.text, 3)[5]).toBe("VoidSymbol")
})

test("continues past empty groups without mutating layout data", () => {
  const input = keyboard([
    [
      ["", ""],
      ["a", "A", "", ""],
    ],
  ])
  const before = structuredClone(input)
  const result = generateLinuxLoadkeysConfiguration(input)
  expect(input).toEqual(before)
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^keycode 41 = VoidSymbol VoidSymbol$/m)
  expect(keyActions(result.text, 2)[0]).toBe("+a")
})

test("trims only trailing empty actions and preserves middle modifier columns", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([[["`", "~", "²", "³"]]], "complex"),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(
    /^keycode 41 = grave asciitilde U\+00B2 U\+00B3 VoidSymbol VoidSymbol VoidSymbol VoidSymbol Meta_grave Meta_asciitilde$/m,
  )
  expect(keyActions(result.text, 41).slice(10)).toEqual(
    Array(6).fill("VoidSymbol"),
  )
})

test("keeps two entries to avoid single-symbol replication", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([[["€", ""]]], "complex"),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^keycode 41 = U\+20AC VoidSymbol$/m)
  expect(keyActions(result.text, 41).slice(1)).toEqual(
    Array(15).fill("VoidSymbol"),
  )
})

test("reports unsupported positions, duplicates, characters and extra levels", () => {
  const duplicate = keyboard([
    [],
    Array.from({ length: 13 }, () => ["a", "A"]),
    Array.from({ length: 12 }, () => ["b", "B"]),
  ])
  expect(
    generateLinuxLoadkeysConfiguration(duplicate).errors.join("\n"),
  ).toMatch(/duplicate console keycode 43/)
  expect(
    generateLinuxLoadkeysConfiguration(
      keyboard([[], [], [], [], [["x", "X"]]]),
    ).errors.join("\n"),
  ).toMatch(/no Linux console keycode/)
  expect(
    generateLinuxLoadkeysConfiguration(keyboard([[["ab", "A"]]])).errors.join(
      "\n",
    ),
  ).toMatch(/one printable character/)
  expect(
    generateLinuxLoadkeysConfiguration(
      keyboard([[["a", "A", "b"]]]),
    ).errors.join("\n"),
  ).toMatch(/too many character levels/)
  expect(
    generateLinuxLoadkeysConfiguration(keyboard([])).errors.join("\n"),
  ).toMatch(/Enter a keyboard layout/)
})

test("warns about Unicode Caps Lock and TypeMatrix assumptions", () => {
  const input = keyboard([[["œ", "Œ"]]])
  input.kind = "TypeMatrix"
  const result = generateLinuxLoadkeysConfiguration(input)
  expect(result.errors).toEqual([])
  expect(result.warnings).toHaveLength(2)
  expect(result.text).toMatch(/^keycode 41 = U\+0153 U\+0152 U\+0153 U\+0152$/m)
})

test("sanitizes metadata so it cannot inject keymap directives", () => {
  const input = keyboard([[["a", "A"]]])
  input.longName = "Test\nplain keycode 1 = VoidSymbol\r\n"
  const result = generateLinuxLoadkeysConfiguration(input)
  expect(result.text).not.toMatch(/^plain keycode 1 =/m)
})
