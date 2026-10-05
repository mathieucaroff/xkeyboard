import keysymdef from "../../asset/x11/keysymdef.h?raw"

export function getKeyName(position: Position, hasLSGT: HasLSGT) {
  let { row, column } = position
  if (row === 0) {
    if (column === 0) {
      return "TLDE"
    }
  } else if (row === 3 && hasLSGT === "LSGT") {
    if (column === 0) {
      return "LSGT"
    }
  } else {
    column += 1
  }
  if (row === 1 && column === 13) {
    return "BKSL"
  }
  let rowLetter = "EDCBA"[row]
  return `A${rowLetter}${String(column).padStart(2, "0")}`
}

const symbolNameTable: Record<number, string> = {}
const symbolNameUnicodeTable: Record<number, string> = {}

keysymdef.split("\n").forEach((line) => {
  const match = line.match(/^#define XK_(\w+)\s+(\w+)(\s+\/\* U\+(\w+))?/)
  if (match) {
    const name = match[1]!
    const code = Number(match[2])
    const unicodeCode = Number("0x" + match[4])
    symbolNameTable[code] = name
    symbolNameUnicodeTable[unicodeCode] = name
  }
})

export function getSymbolName(symbol: string) {
  if (!symbol) {
    return ""
  }
  let code = symbol.codePointAt(0) ?? ".".charCodeAt(0)
  return symbolNameTable[code] ?? symbolNameUnicodeTable[code] ?? `U${code.toString(16)}`
}