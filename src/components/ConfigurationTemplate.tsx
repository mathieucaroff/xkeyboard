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
      <div className="mb-3 mr-10 mt-4">
        <h3 className="m-0">{title}</h3>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          size="large"
          className="!border !border-current"
          onClick={handleCopy}
        >
          Copy to clipboard
          <CopyIcon />
        </Button>
        <Button
          size="large"
          className="!border !border-current"
          onClick={handleDownload}
        >
          Download{" "}
          <code className="rounded bg-[color:var(--foreground-color)] px-1 py-0.5 text-[color:var(--background-color)]">
            {filename}
          </code>
          <DownloadIcon />
        </Button>
      </div>
      {children ? <div className="mb-3 mt-2">{children}</div> : null}
      {warning ? (
        <div className="mb-3 mt-2 border-l-[3px] border-current py-2 pl-3">
          {warning}
        </div>
      ) : null}
      <pre>{keyboardConfigText}</pre>
    </div>
  )
}
