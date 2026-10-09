export interface LayoutPreset {
  value: string
  name: string
  longName: string
  text: string
  complexity: Complexity
  hasLSGT: HasLSGT
}

export function parseLayoutFile(path: string, content: string): LayoutPreset {
  const lines = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
  const [name, longName, complexity, hasLSGT] = lines
    .slice(0, 4)
    .map((line) => line.trim())
  if (!name || !longName) {
    throw new Error("The first two lines must contain a name and display name")
  }
  if (complexity !== "simple" && complexity !== "complex") {
    throw new Error('The third line must be "simple" or "complex"')
  }
  if (hasLSGT !== "LSGT" && hasLSGT !== "noLSGT") {
    throw new Error('The fourth line must be "LSGT" or "noLSGT"')
  }

  const grid = lines
    .slice(4)
    .map((line, index) => ({
      text: line.trim(),
      lineNumber: index + 5,
    }))
    .filter((line) => line.text !== "")
  const groupSize = complexity === "simple" ? 2 : 4
  if (
    grid.length === 0 ||
    grid.length % groupSize !== 0 ||
    grid.length / groupSize > 5
  ) {
    throw new Error(
      `Expected one to five complete groups of ${groupSize} grid lines`,
    )
  }
  for (const line of grid) {
    const tokens = line.text.split(/\s+/)
    const replacements = tokens.filter(
      (token) => token.startsWith(":") && token.length > 1,
    )
    const keys = tokens.filter((token) => !replacements.includes(token))
    if (keys.length > 14) {
      throw new Error(
        `Line ${line.lineNumber}: at most 14 key columns are supported`,
      )
    }
    if (keys.filter((token) => token === ":").length !== replacements.length) {
      throw new Error(
        `Line ${line.lineNumber}: each ':' placeholder needs one ':symbol' replacement`,
      )
    }
    for (const token of tokens) {
      const symbol =
        token.startsWith(":") && token.length > 1 ? token.slice(1) : token
      const codePoint = symbol.codePointAt(0)!
      if (
        Array.from(symbol).length !== 1 ||
        codePoint < 0x20 ||
        (codePoint >= 0x7f && codePoint <= 0x9f) ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        throw new Error(
          `Line ${line.lineNumber}: invalid symbol ${JSON.stringify(token)}`,
        )
      }
    }
  }

  return {
    value: path.replace(/^\/layout\//, "").replace(/\.txt$/, ""),
    name,
    longName,
    text: grid.map((line) => line.text).join("\n"),
    complexity,
    hasLSGT,
  }
}

export function loadLayoutFiles(files: Record<string, string>): LayoutPreset[] {
  const presets: LayoutPreset[] = []
  for (const [path, content] of Object.entries(files)) {
    try {
      presets.push(parseLayoutFile(path, content))
    } catch (error) {
      console.error(`Invalid keyboard layout ${path}:`, error)
    }
  }
  return presets
}
