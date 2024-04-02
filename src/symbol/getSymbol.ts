import { symbolTable } from "./symbolTable"

export function getSymbol(symbol: string) {
  if (
    ("0" <= symbol && symbol <= "9") ||
    ("a" <= symbol && symbol <= "z") ||
    ("A" <= symbol && symbol <= "Z") ||
    symbol === ""
  ) {
    return symbol
  }
  if (symbolTable[symbol] === undefined) {
    throw new Error(`symbol not found: ${symbol}`)
  }
  return symbolTable[symbol]
}
