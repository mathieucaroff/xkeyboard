import { Fragment } from "react/jsx-runtime"

export interface KeyboardRowProps {
  rowIndex: number
  kind: KeyboardKind
  hasLSGT: HasLSGT
  row: string[][]
  pressedKeys: Set<string>
}

function KeyboardViewKey({ group }: { group: string[] }) {
  return (
    <>
      <div>
        <span className="keyboard__character keyboard__character--1">
          {group[1]}
        </span>
        <span className="keyboard__character keyboard__character--3">
          {group[3]}
        </span>
      </div>
      <div>
        <span className="keyboard__character keyboard__character--0">
          {group[0]}
        </span>
        <span className="keyboard__character keyboard__character--2">
          {group[2]}
        </span>
      </div>
    </>
  )
}

function isActiveGroup(group: string[], pressedKeys: Set<string>) {
  return (
    pressedKeys.size > 0 &&
    group.some((character) => pressedKeys.has(character))
  )
}

export function KeyboardRow(props: KeyboardRowProps) {
  const { rowIndex, kind, hasLSGT, row, pressedKeys } = props

  return (
    <tr>
      {rowIndex !== 0 ? (
        <td
          className={`keyboard__key keyboard__miniText keyboard__offset--${kind}--${rowIndex} keyboard__offset--${hasLSGT}`}
        >
          {kind === "TypeMatrix"
            ? { [0]: "del", [1]: "tab", [2]: "shift", [3]: null }[rowIndex]
            : null}
        </td>
      ) : null}
      {row.map((group, columnIndex) => (
        <Fragment key={columnIndex}>
          {kind === "TypeMatrix" && columnIndex === (rowIndex === 0 ? 6 : 5) ? (
            <td
              className={`keyboard__key keyboard__miniText keyboard__centralKey--${kind}--${rowIndex}`}
            >
              {{ [0]: "del", [1]: "bksp", [2]: "enter", [3]: null }[rowIndex]}
            </td>
          ) : null}
          {
            <td
              className={`keyboard__key keyboard__key--${kind}--${columnIndex}--${rowIndex}${
                isActiveGroup(group, pressedKeys)
                  ? " keyboard__key--active"
                  : ""
              }`}
            >
              <KeyboardViewKey group={group} />
            </td>
          }
        </Fragment>
      ))}
    </tr>
  )
}
