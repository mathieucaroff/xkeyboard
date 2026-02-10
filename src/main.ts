import { createElement } from "react"
import { createRoot } from "react-dom/client"
import * as packageInfo from "../package.json"
import { App } from "./App"
import { HeaderHelpTooltip } from "./HeaderHelpTooltip"
import { githubCornerHTML } from "./lib/githubCorner"
import "./style.css"

function main() {
  let cornerDiv = document.createElement("div")
  cornerDiv.innerHTML = githubCornerHTML(
    packageInfo.repository.url,
    packageInfo.version,
  )
  document.body.appendChild(cornerDiv)

  let root = createRoot(document.body.querySelector("#app")!)
  root.render(createElement(App))

  let tooltip = createRoot(document.body.querySelector("#headerHelpTooltip")!)
  tooltip.render(createElement(HeaderHelpTooltip))
}

main()
