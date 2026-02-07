import { Button } from "antd"
import type { ReactNode } from "react"
import { createTextBlob, normalizeNewlines } from "../lib/textEncoding"
import { CopyIcon, DownloadIcon } from "../icon/ActionIcons"

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
  const normalizedText = normalizeNewlines(keyboardConfigText, fileNewline)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedText)
    } catch {
      // Ignore clipboard errors silently.
    }
  }

  const handleDownload = () => {
    const blob = createTextBlob(normalizedText, fileEncoding)
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="config-header">
        <h3>{title}</h3>
      </div>
      <div className="config-actions">
        <Button
          size="large"
          className="copy-button config-button"
          onClick={handleCopy}
        >
          Copy to clipboard
          <CopyIcon />
        </Button>
        <Button
          size="large"
          className="download-button config-button"
          onClick={handleDownload}
        >
          Download <code className="invert">{filename}</code>
          <DownloadIcon />
        </Button>
      </div>
      {children ? <div className="config-instruction">{children}</div> : null}
      {warning ? <div className="config-warning">{warning}</div> : null}
      <pre>{keyboardConfigText}</pre>
    </div>
  )
}
