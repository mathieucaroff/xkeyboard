import { Tooltip } from "antd"
import clsx from "clsx"
import { ReactNode } from "react"

export interface HelpTooltipProps {
  children: ReactNode
  className?: string
  amongInputs?: boolean
}

export function HelpTooltip(props: HelpTooltipProps) {
  const { children, className, amongInputs } = props
  return (
    <Tooltip
      className="ml-1"
      placement="rightTop"
      trigger={["hover", "click"]}
      title={children}
    >
      <button
        type="button"
        className={clsx(
          "help-tooltip-button",
          amongInputs && "help-tooltip-button--among-inputs",
          className,
        )}
        aria-label="Layout format help"
      >
        <span className="help-tooltip-icon">?</span>
      </button>
    </Tooltip>
  )
}
