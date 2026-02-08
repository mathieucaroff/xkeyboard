import { Button } from "antd"
import type { ReactNode } from "react"
import { createTextBlob, normalizeNewlines } from "../lib/textEncoding"
import { CopyIcon, DownloadIcon } from "../icon/ActionIcons"
import { KEYBOARD_DEFAULT_NAME } from "../App"

export interface ConfigurationTemplateProps {
  title: string
  defaultedKeyboardName: string
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
    defaultedKeyboardName,
    warning,
    fileExtension,
    fileNewline = "lf",
    fileEncoding = "utf-8",
    keyboardConfigText,
    children,
  } = props

  const filename = `${defaultedKeyboardName}.${sanitizeExtension(fileExtension)}`
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
    <div className="overflow-x-auto rounded border border-black p-2">
      <div className="mb-3 mr-10">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      </div>
      {children ? <div className="mb-3 mt-2">{children}</div> : null}
      {warning ? (
        <div className="mb-3 mt-2 border-l-[3px] border-current py-2 pl-3">
          {warning}
        </div>
      ) : null}
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
          Download <code className="-mb-0.5 rounded py-0.5">{filename}</code>
          <DownloadIcon />
        </Button>
      </div>
      <div className="my-4 h-px bg-black" />
      <pre className="[tab-size:8]">{keyboardConfigText}</pre>
    </div>
  )
}
