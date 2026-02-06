export function normalizeNewlines(text: string, newline: NewlineStyle) {
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

export function createTextBlob(text: string, encoding: TextEncoding) {
  if (encoding === "utf-16le") {
    return new Blob([encodeUtf16LE(text)], {
      type: "text/plain;charset=utf-16le",
    })
  }
  return new Blob([new TextEncoder().encode(text)], {
    type: "text/plain;charset=utf-8",
  })
}
