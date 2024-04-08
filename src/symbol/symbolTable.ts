import keysymdef from "bundle-text:../../asset/x11/keysymdef.h"

const symbolNameTable: string[] = []
const symbolNameUnicodeTable: string[] = {} as any

keysymdef.split("\n").forEach((line) => {
  const match = line.match(/^#define XK_(\w+)\s+(\w+)(\s+\/\* U\+(\w+))?/)
  if (match) {
    const name = match[1]
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
  let code = symbol.charCodeAt(0)
  let name =
    symbolNameTable[code] ??
    symbolNameUnicodeTable[code] ??
    `U${code.toString(16)}`
  return name
}
