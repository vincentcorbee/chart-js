import { createElement } from "./create-element"

export const createText = (content, x, y, textAnchor, fontSize) =>
  createElement(
    'text',
    x,
    y,
    {
      style: {
        textAnchor,
        fontSize,
        lineHeight: fontSize,
      },
    },
    content
  )