import { Button } from "antd"

export interface DownloadButtonProps {
  filename: string
  content: string
  newline: "lf" | "crlf"
  encoding: "utf-8" | "utf-16le"
  label?: string
}

function normalizeNewlines(text: string, newline: "lf" | "crlf") {
  if (text.slice(-1) !== "\n") {
    text += "\n"
  }
  if (newline === "crlf") {
    return text.replace(/\r?\n/g, "\r\n")
  }
  return text.replace(/\r\n/g, "\n")
}

function encodeUtf16LE(text: string) {
  const buffer = new ArrayBuffer(text.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < text.length; i++) {
    view.setUint16(i * 2, text.charCodeAt(i), true)
  }
  return buffer
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
        const blob =
          encoding === "utf-16le"
            ? new Blob([encodeUtf16LE(text)], {
                type: "text/plain;charset=utf-16le",
              })
            : new Blob([new TextEncoder().encode(text)], {
                type: "text/plain;charset=utf-8",
              })

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
