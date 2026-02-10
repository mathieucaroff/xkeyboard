import { HelpTooltip } from "./components/HelpTooltip"

const helpTextSelector =
  "Pick an existing layout from the selector to see the format used in the large layout text box below."

const helpTextConfiguration =
  "The content of the layout text box is used to generate the configuration file for the selected operating system. You can copy the content to the clipboard or download it as a file."

export function HeaderHelpTooltip() {
  return (
    <HelpTooltip>
      <p>{helpTextSelector}</p>
      <p>{helpTextConfiguration}</p>
    </HelpTooltip>
  )
}
