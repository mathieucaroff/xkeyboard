import { expect, spyOn, test } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { loadLayoutFiles, parseLayoutFile } from "./layoutFiles"

const simpleLayout = "test\nTest layout\nsimple\nnoLSGT\nA : ::\na : :.\n"

test("all shipped layout files are valid and preserve literal symbols", () => {
  const directory = new URL("../../layout/", import.meta.url)
  const presets = readdirSync(directory)
    .filter((name) => name.endsWith(".txt"))
    .map((name) =>
      parseLayoutFile(
        `/layout/${name}`,
        readFileSync(new URL(name, directory), "utf8"),
      ),
    )
  const qwerty = presets.find((preset) => preset.value === "Qwerty")!
  expect(qwerty.text.split("\n")).toHaveLength(8)
  expect(qwerty.text.split("\n")[1]?.startsWith("` ")).toBe(true)
  expect(qwerty.text.split("\n")[3]?.endsWith(" \\")).toBe(true)
  const assetFull = presets.find((preset) => preset.value === "Asset2025Full")!
  expect(assetFull.complexity).toBe("complex")
  expect(assetFull.text.split("\n")).toHaveLength(16)
  expect(assetFull.text.split("\n")[3]?.startsWith("\u00b2 ")).toBe(true)
  expect(assetFull.text.split("\n")[12]?.startsWith("- ")).toBe(true)
})

test("parses metadata, path, replacement tokens and normalizes BOM/CRLF", () => {
  expect(
    parseLayoutFile(
      "/layout/nested/Test.txt",
      "\uFEFF" + simpleLayout.replace(/\n/g, "\r\n"),
    ),
  ).toEqual({
    value: "nested/Test",
    name: "test",
    longName: "Test layout",
    complexity: "simple",
    hasLSGT: "noLSGT",
    text: "A : ::\na : :.",
  })
})

test("accepts complex groups, blank separators and short modifier rows", () => {
  expect(
    parseLayoutFile(
      "/layout/Test.txt",
      "test\nTest\ncomplex\nLSGT\nA B\na b\n.\n.\n\nC\nc\n.\n.\n",
    ).complexity,
  ).toBe("complex")
})

test("rejects invalid metadata, incomplete grids, symbols and replacement tokens", () => {
  for (const content of [
    simpleLayout.replace("test\n", "\n"),
    simpleLayout.replace("Test layout", ""),
    simpleLayout.replace("simple", "complexe"),
    simpleLayout.replace("noLSGT", "Basic"),
    "test\nTest\nsimple\nLSGT\n",
    simpleLayout + "B\n",
    simpleLayout.replace("A : ::", "AB"),
    simpleLayout.replace("A : ::", ":"),
    simpleLayout.replace("A : ::", "A ::"),
    simpleLayout.replace("A : ::", "A : :ab"),
    simpleLayout.replace("A : ::", "\u007f"),
    simpleLayout.replace("A : ::", "\ud800"),
    simpleLayout.replace("A : ::", Array(15).fill("A").join(" ")),
    "test\nTest\nsimple\nLSGT\n" + "A\na\n".repeat(6),
  ]) {
    expect(() => parseLayoutFile("/layout/Bad.txt", content)).toThrow()
  }
})

test("excludes invalid files and reports their paths without discarding valid ones", () => {
  const error = spyOn(console, "error").mockImplementation(() => {})
  try {
    const presets = loadLayoutFiles({
      "/layout/Bad.txt": "invalid",
      "/layout/Good.txt": simpleLayout,
    })
    expect(presets.map((preset) => preset.value)).toEqual(["Good"])
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]?.[0]).toContain("/layout/Bad.txt")
  } finally {
    error.mockRestore()
  }
})
