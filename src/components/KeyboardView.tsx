import { Fragment } from "react/jsx-runtime"

export interface KeyboardViewProp {
  keyboard: Keyboard
}

export function KeyboardView(prop: KeyboardViewProp) {
  let { keyboard } = prop
  let { kind, layout, hasLSGT } = keyboard
  const baseKeyClass =
    "w-[37px] border border-current text-center whitespace-nowrap"
  const miniTextClass = "text-[8px] pb-[10px]"
  const characterClass = "inline-block w-[18px]"
  const typeMatrixWidthClass = "w-[40px] max-w-[40px]"

  const joinClasses = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ")

  const typeMatrixBorderClass = (row: number) =>
    row === 2 ? "border-b-0" : row === 3 ? "border-t-0" : ""

  const offsetWidthClass = (row: number) => {
    if (kind === "TypeMatrix") {
      return typeMatrixWidthClass
    }
    if (row === 1) {
      return "w-[52px]"
    }
    if (row === 2) {
      return "w-[68px]"
    }
    if (row === 3) {
      return hasLSGT === "LSGT" ? "w-[40px]" : "w-[83px]"
    }
    return ""
  }

  const keyWidthClass = (column: number, row: number) => {
    if (kind === "Basic" && column === 0 && row === 0) {
      return "w-[32px] max-w-[32px]"
    }
    if (kind === "TypeMatrix" && column === 0 && row === 0) {
      return "w-[40px]"
    }
    return ""
  }

  return (
    <div>
      {layout.characterTable.map((row, k) => (
        <table key={k}>
          <tbody>
            <tr>
              {k !== 0 ? (
                <td
                  className={joinClasses(
                    baseKeyClass,
                    miniTextClass,
                    offsetWidthClass(k),
                    kind === "TypeMatrix" && typeMatrixBorderClass(k),
                  )}
                >
                  {kind === "TypeMatrix"
                    ? { [0]: "del", [1]: "tab", [2]: "shift", [3]: null }[k]
                    : null}
                </td>
              ) : null}
              {row.map((group, m) => (
                <Fragment key={m}>
                  {kind === "TypeMatrix" && m === (k === 0 ? 6 : 5) ? (
                    <td
                      className={joinClasses(
                        baseKeyClass,
                        miniTextClass,
                        typeMatrixWidthClass,
                        typeMatrixBorderClass(k),
                      )}
                    >
                      {{ [0]: "del", [1]: "bksp", [2]: "enter", [3]: null }[k]}
                    </td>
                  ) : null}
                  {
                    <td
                      className={joinClasses(baseKeyClass, keyWidthClass(m, k))}
                    >
                      <div>
                        <span className={characterClass}>{group[1]}</span>
                        <span className={characterClass}>{group[3] || ""}</span>
                      </div>
                      <div>
                        <span className={characterClass}>{group[0]}</span>
                        <span className={characterClass}>{group[2] || ""}</span>
                      </div>
                    </td>
                  }
                </Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  )
}
