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
      className="download-button"
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
    </Button>
  )
}
