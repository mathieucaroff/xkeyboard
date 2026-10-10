import { expect, test } from "bun:test"
import {
  generateAndroidKcmConfiguration,
  getAndroidKcmCharacter,
  getAndroidKcmKeyName,
} from "./AndroidKcmTable"

function keyboard(
  characterTable: string[][][],
  complexity: Complexity = "simple",
  hasLSGT: HasLSGT = "noLSGT",
): Keyboard {
  return {
    kind: "Basic",
    name: "test",
    defaultedName: "test",
    longName: "Test layout",
    layout: { complexity, characterTable },
    hasLSGT,
    hasNavigationPad: "noNavigationPad",
    hasNumpad: "noNumpad",
  }
}

function keyBlock(text: string, name: string): string {
  const block = text.match(
    new RegExp(`^key ${name} \\{\\n([\\s\\S]*?)^\\}`, "m"),
  )
  expect(block).not.toBeNull()
  return block![1]!
}

function characterFor(block: string, active: string[]): string {
  let result = "none"
  for (const line of block.trim().split("\n")) {
    const [properties, value] = line.trim().split(": ")
    if (properties === "label" || properties === "number") continue
    for (const property of properties!.split(", ")) {
      const modifiers = property === "base" ? [] : property.split("+")
      const matches =
        modifiers.every((modifier) => active.includes(modifier)) &&
        ["ctrl", "lalt", "ralt", "meta"].every(
          (modifier) =>
            !active.includes(modifier) || modifiers.includes(modifier),
        )
      if (matches) result = value!
    }
  }
  return result
}

test("maps standard positions, ISO extra key and alternate backslash", () => {
  for (const [row, column, expected] of [
    [0, 0, "GRAVE"],
    [0, 1, "1"],
    [0, 12, "EQUALS"],
    [1, 0, "Q"],
    [1, 12, "BACKSLASH"],
    [2, 11, "BACKSLASH"],
    [3, 0, "Z"],
    [3, 9, "SLASH"],
    [4, 0, null],
  ] as const) {
    expect(getAndroidKcmKeyName({ row, column }, "noLSGT")).toBe(expected)
  }
  expect(getAndroidKcmKeyName({ row: 3, column: 0 }, "LSGT")).toBe("RO")
  expect(getAndroidKcmKeyName({ row: 3, column: 1 }, "LSGT")).toBe("Z")
  const result = generateAndroidKcmConfiguration(
    keyboard(
      [
        [],
        [],
        [],
        [
          ["<", ">"],
          ["z", "Z"],
        ],
      ],
      "simple",
      "LSGT",
    ),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toContain("map key 86 RO\n")
  expect(result.text).toContain("key RO {")
  expect(result.warnings.join(" ")).toContain("JIS")
})

test("escapes literals and rejects unsupported characters", () => {
  expect(getAndroidKcmCharacter("'")).toBe("'\\''")
  expect(getAndroidKcmCharacter("\\")).toBe("'\\\\'")
  expect(getAndroidKcmCharacter('"')).toBe("'\"'")
  expect(getAndroidKcmCharacter("\u20ac")).toBe("'\\u20AC'")
  expect(getAndroidKcmCharacter(" ")).toBe("' '")
  expect(getAndroidKcmCharacter("")).toBe("none")
  for (const invalid of [
    "ab",
    "e\u0301",
    "\u0301",
    "\ud800",
    "\u{1f600}",
    "\n",
    "\u0000",
    "\u007f",
    "\uef00",
    "\uef01",
  ]) {
    expect(() => getAndroidKcmCharacter(invalid)).toThrow()
  }
})

test("preserves levels, caps inversion, labels and nonprinting shortcuts", () => {
  const result = generateAndroidKcmConfiguration(
    keyboard([[], [["a", "A", "\u00e9", "\u00c9"]]], "complex"),
  )
  expect(result.errors).toEqual([])
  expect(result.text).toMatch(/^type OVERLAY$/m)
  const block = keyBlock(result.text, "Q")
  expect(block).toContain("label: 'A'")
  for (const [modifiers, expected] of [
    [[], "'a'"],
    [["shift"], "'A'"],
    [["capslock"], "'A'"],
    [["shift", "capslock"], "'a'"],
    [["ralt"], "'\\u00E9'"],
    [["shift", "ralt"], "'\\u00C9'"],
    [["capslock", "ralt"], "'\\u00C9'"],
    [["shift", "capslock", "ralt"], "'\\u00E9'"],
    [["ctrl"], "none"],
    [["lalt"], "none"],
    [["meta"], "none"],
    [["ctrl", "ralt"], "none"],
    [["lalt", "ralt"], "none"],
    [["shift", "meta"], "none"],
  ] as [string[], string][])
    expect(characterFor(block, modifiers)).toBe(expected)
})

test("simple right Alt repeats levels; punctuation ignores caps and numbers use assigned characters", () => {
  const result = generateAndroidKcmConfiguration(
    keyboard([
      [
        ["!", "1"],
        ["q", "Q"],
      ],
    ]),
  )
  const block = keyBlock(result.text, "GRAVE")
  expect(block).toContain("number: '1'")
  expect(block).not.toContain("capslock:")
  expect(characterFor(block, ["capslock"])).toBe("'!'")
  expect(characterFor(block, ["ralt"])).toBe("'!'")
  expect(characterFor(block, ["shift", "ralt"])).toBe("'1'")
  expect(keyBlock(result.text, "1")).toContain("number: none")
})

test("empty complex levels suppress text and absent keys remain inherited", () => {
  const result = generateAndroidKcmConfiguration(
    keyboard([[["a", "", "", ""]]], "complex"),
  )
  const block = keyBlock(result.text, "GRAVE")
  expect(characterFor(block, ["shift"])).toBe("none")
  expect(characterFor(block, ["ralt"])).toBe("none")
  expect(result.text).not.toMatch(/^key (SPACE|ENTER|NUMPAD_0|DPAD_UP) /m)
})

test("reports duplicates, positions, excess levels, empty layouts and invalid character locations", () => {
  const duplicate = keyboard([
    [],
    Array.from({ length: 13 }, () => ["a", "A"]),
    Array.from({ length: 12 }, () => ["b", "B"]),
  ])
  expect(generateAndroidKcmConfiguration(duplicate).errors.join(" ")).toContain(
    "duplicate Android key BACKSLASH",
  )
  expect(
    generateAndroidKcmConfiguration(
      keyboard([[], [], [], [], [["x", "X"]]]),
    ).errors.join(" "),
  ).toContain("no Android physical-key mapping")
  expect(
    generateAndroidKcmConfiguration(keyboard([[["a", "A", "b"]]])).errors.join(
      " ",
    ),
  ).toContain("too many character levels")
  expect(
    generateAndroidKcmConfiguration(
      keyboard([[["a", "\u{1f600}"]]]),
    ).errors.join(" "),
  ).toContain("Row 1, key 1, level 2")
  for (const table of [[], [[["", ""]]]])
    expect(
      generateAndroidKcmConfiguration(keyboard(table)).errors.length,
    ).toBeGreaterThan(0)
})

test("is deterministic, sanitizes comments, keeps input immutable and warns about TypeMatrix", () => {
  const input = keyboard([[["a", "A"]]])
  input.longName = "Name\ntype FULL\r\u2028\u2029"
  input.kind = "TypeMatrix"
  input.hasLSGT = "LSGT"
  const before = structuredClone(input)
  const result = generateAndroidKcmConfiguration(input)
  expect(input).toEqual(before)
  expect(generateAndroidKcmConfiguration(input)).toEqual(result)
  expect(result.text.match(/^type /gm)).toHaveLength(1)
  expect(result.text.endsWith("\n")).toBe(true)
  expect(result.text).not.toContain("map key 86")
  expect(result.warnings.join(" ")).toContain("TypeMatrix")
})
