import { useEffect, useState } from "react"
import { KeyboardRow } from "./KeyboardRow"
import "./keyboardView.css"

export interface KeyboardViewProp {
  className?: string
  keyboard: Keyboard
}

export function KeyboardView(prop: KeyboardViewProp) {
  let { className, keyboard } = prop
  let { kind, layout, hasLSGT } = keyboard
  let [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set())

  const normalizeKey = (key: string) => {
    if (key === " " || key === "Spacebar" || key === "Space") {
      return " "
    }
    if (key.length === 1) {
      return key
    }
    return null
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalized = normalizeKey(event.key)
      if (!normalized) {
        return
      }
      setPressedKeys((current) => {
        if (current.has(normalized)) {
          return current
        }
        const next = new Set(current)
        next.add(normalized)
        return next
      })
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalized = normalizeKey(event.key)
      if (!normalized) {
        return
      }
      setPressedKeys((current) => {
        if (!current.has(normalized)) {
          return current
        }
        const next = new Set(current)
        next.delete(normalized)
        return next
      })
    }

    const handleBlur = () => {
      setPressedKeys(new Set())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

  return (
    <div className={`keyboard ${className ?? ""}`}>
      {layout.characterTable.map((row, k) => (
        <table key={k} className="border-separate">
          <tbody>
            <KeyboardRow
              rowIndex={k}
              kind={kind}
              hasLSGT={hasLSGT}
              row={row}
              pressedKeys={pressedKeys}
            />
          </tbody>
        </table>
      ))}
    </div>
  )
}
