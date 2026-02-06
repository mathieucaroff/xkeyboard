import { Button } from "antd"
import type { ReactNode } from "react"
import { DownloadButton } from "./DownloadButton"
import { normalizeNewlines } from "../lib/textEncoding"

export interface ConfigurationTemplateProps {
  title: string
  keyboardName: string
  warning?: ReactNode
  fileExtension: string
  fileNewline?: NewlineStyle
  fileEncoding?: TextEncoding
  keyboardConfigText: string
  children?: ReactNode
}

function sanitizeExtension(extension: string) {
  return extension.startsWith(".") ? extension.slice(1) : extension
}

export function ConfigurationTemplate(props: ConfigurationTemplateProps) {
  const {
    title,
    keyboardName,
    warning,
    fileExtension,
    fileNewline = "lf",
    fileEncoding = "utf-8",
    keyboardConfigText,
    children,
  } = props

  const filename = `${keyboardName || "layout"}.${sanitizeExtension(fileExtension)}`
  const clipboardText = normalizeNewlines(keyboardConfigText, fileNewline)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText)
    } catch {
      // Ignore clipboard errors silently.
    }
  }

  return (
    <div>
      <div className="config-header">
        <h3>{title}</h3>
        <div className="config-actions">
          <Button
            size="large"
            className="copy-button config-button"
            onClick={handleCopy}
          >
            Copy to clipboard
            <svg
              className="button-icon"
              viewBox="0 0 24 24"
              aria-hidden
              focusable="false"
            >
              <path d="M16 1H8a2 2 0 0 0-2 2v2h2V3h8v2h2V3a2 2 0 0 0-2-2z" />
              <path d="M18 5H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H6V7h12v14z" />
            </svg>
          </Button>
          <DownloadButton
            filename={filename}
            content={keyboardConfigText}
            newline={fileNewline}
            encoding={fileEncoding}
          />
        </div>
      </div>
      {children ? <div className="config-instruction">{children}</div> : null}
      {warning ? <div className="config-warning">{warning}</div> : null}
      <pre>{keyboardConfigText}</pre>
    </div>
  )
}
