import { expect, test } from "bun:test"
import {
  generateLinuxLoadkeysConfiguration,
  getLinuxLoadkeysKeyCode,
  getLinuxLoadkeysSymbol,
} from "./LinuxLoadkeysTable"

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
  expect(result.text).toMatch(/^plain keycode 16 = \+c$/m)
  expect(result.text).toMatch(/^shift keycode 16 = \+C$/m)
  expect(result.text).toMatch(/^altgr keycode 16 = \+c$/m)
  expect(result.text).toMatch(/^shift altgr keycode 16 = \+C$/m)
  expect(result.text).toMatch(/^control keycode 16 = Control_c$/m)
  expect(result.text).toMatch(/^control alt keycode 16 = Meta_Control_c$/m)
  expect(result.text).toMatch(/^shift alt keycode 16 = Meta_C$/m)
  expect(result.text).not.toMatch(
    /^keymaps|^include|keycode (14|15|28|57|59|102) =/m,
  )
})

test("complex maps preserve four levels and bind right Alt in every map", () => {
  const result = generateLinuxLoadkeysConfiguration(
    keyboard([[["é", "É", "€", ""]]], "complex"),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^plain keycode 41 = \+U\+00E9$/m)
  expect(result.text).toMatch(/^shift keycode 41 = \+U\+00C9$/m)
  expect(result.text).toMatch(/^altgr keycode 41 = U\+20AC$/m)
  expect(result.text).toMatch(/^shift altgr keycode 41 = VoidSymbol$/m)
  expect(result.text).toMatch(/^alt keycode 41 = VoidSymbol$/m)
  expect(result.text.match(/keycode 100 = AltGr/g)).toHaveLength(16)
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
  expect(result.text).toMatch(/^control keycode 41 = nul$/m)
  expect(result.text).toMatch(/^shift control keycode 41 = nul$/m)
  expect(result.text).toMatch(/^control alt keycode 41 = Meta_nul$/m)
  expect(result.text).toMatch(/^control keycode 2 = Escape$/m)
  expect(result.text).toMatch(/^control keycode 3 = Delete$/m)
  expect(result.text).toMatch(/^shift control keycode 3 = VoidSymbol$/m)
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
  expect(result.text).toMatch(/^plain keycode 41 = VoidSymbol$/m)
  expect(result.text).toMatch(/^plain keycode 2 = \+a$/m)
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
  expect(result.text).toMatch(/^plain keycode 41 = U\+0153$/m)
})

test("sanitizes metadata so it cannot inject keymap directives", () => {
  const input = keyboard([[["a", "A"]]])
  input.longName = "Test\nplain keycode 1 = VoidSymbol\r\n"
  const result = generateLinuxLoadkeysConfiguration(input)
  expect(result.text).not.toMatch(/^plain keycode 1 =/m)
})
