import { padColorPart } from "./pad-color-part"

export const genColor = () => {
  const r = padColorPart(Math.floor(Math.random() * 255).toString(16))
  const g = padColorPart(Math.floor(Math.random() * 255).toString(16))
  const b = padColorPart(Math.floor(Math.random() * 255).toString(16))

  return `#${r}${g}${b}`
}