import { Button } from "antd"
import { createTextBlob, normalizeNewlines } from "../lib/textEncoding"

export interface DownloadButtonProps {
  filename: string
  content: string
  newline: NewlineStyle
  encoding: TextEncoding
  label?: string
}

export function DownloadButton(props: DownloadButtonProps) {
  const { filename, content, newline, encoding, label: initialLabel } = props

  const label = initialLabel ?? (
    <>
      Download <code className="invert">{filename}</code>
    </>
  )

  return (
    <Button
      size="large"
      className="download-button config-button"
      onClick={() => {
        const text = normalizeNewlines(content, newline)
        const blob = createTextBlob(text, encoding)

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }}
    >
      {label}
      <svg
        className="button-icon"
        viewBox="0 0 24 24"
        aria-hidden
        focusable="false"
      >
        <path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4.01 4a1 1 0 0 1-1.4 0l-4.01-4a1 1 0 0 1 1.4-1.42l2.32 2.3V4a1 1 0 0 1 1-1z" />
        <path d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z" />
      </svg>
    </Button>
  )
}
