import React from "react"
import "./keyboardView.css"

export interface KeyboardViewProp {
  keyboard: Keyboard
}

export function KeyboardView(prop: KeyboardViewProp) {
  let { keyboard } = prop
  let { kind, layout, hasLSGT } = keyboard

  return (
    <div className="keyboard">
      {layout.characterTable.map((row, k) => (
        <table key={k}>
          <tbody>
            <tr>
              {k !== 0 ? (
                <td
                  className={`keyboard__key keyboard__miniText keyboard__offset--${kind}--${k} keyboard__offset--${hasLSGT}`}
                >
                  {kind === "TypeMatrix"
                    ? { [0]: "del", [1]: "tab", [2]: "shift", [3]: null }[k]
                    : null}
                </td>
              ) : null}
              {row.map((group, m) => (
                <>
                  {kind === "TypeMatrix" &&
                  [m === 6, m === 5, m === 5, m === 5][k] ? (
                    <td
                      className={`keyboard__key keyboard__miniText keyboard__centralKey--${kind}--${k}`}
                    >
                      {{ [0]: "del", [1]: "bksp", [2]: "enter", [3]: null }[k]}
                    </td>
                  ) : null}
                  {
                    <td
                      className={`keyboard__key keyboard__key--${kind}--${m}--${k}`}
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
                  }
                </>
              ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  )
}
