import classNames from "classnames"
import React from "react"
import { Keyboard } from "../type"
import "./keyboardView.css"

export interface KeyboardViewProp {
  keyboard: Keyboard
}

export function KeyboardView(prop: KeyboardViewProp) {
  let { keyboard } = prop
  let { kind, layout } = keyboard

  return (
    <div className="keyboard">
      {layout.characterTable.map((row, k) => (
        <table key={k}>
          <tbody>
            <tr>
              {k !== 0 ? (
                <td
                  className={`keyboard__key keyboard__miniText keyboard__offset--${kind}--${k}`}
                >
                  {kind === "TypeMatrix"
                    ? { [0]: "del", [1]: "tab", [2]: "shift", [3]: null }[k]
                    : null}
                </td>
              ) : null}
              {row.map((group, m) => (
                <>
                  {kind === "TypeMatrix" && m - Number(k === 2) === 5 ? (
                    <td
                      className={`keyboard__key keyboard__miniText keyboard__centralKey--${kind}--${k}`}
                    >
                      {{ [0]: "del", [1]: "bksp", [2]: "enter", [3]: null }[k]}
                    </td>
                  ) : null}
                  {kind === "TypeMatrix" && k === 2 && m === 0 ? null : (
                    <td
                      className={`keyboard__key keyboard__key--${m}--${k}`}
                      key={m}
                    >
                      <div>
                        <span className="keyboard__character">{group[1]}</span>
                        <span className="keyboard__character">
                          {group[3] || ""}
                        </span>
                      </div>
                      <div>
                        <span className="keyboard__character">{group[0]}</span>
                        <span className="keyboard__character">
                          {group[2] || ""}
                        </span>
                      </div>
                    </td>
                  )}
                </>
              ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  )
}
