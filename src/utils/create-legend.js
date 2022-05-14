import { getDimensions } from "./get-dimensions"
import { createElement } from "./create-element"

export const createLegend = (
  { labels, position = 'bottom' },
  offsetX,
  offsetY,
  width,
  height,
  svg,
  fontSize,
  lineHeight,
  VALUE_SIZE
) => {
  const symbolWidth = 15
  const symbolHeight = 12
  const spacing = 10
  const labelDimensions = labels
    .map(
      label =>
        getDimensions(label.name, {
          'font-family': 'inherit',
          'font-size': fontSize,
          'line-height': lineHeight,
        }).width
    )
  const [biggest] = labelDimensions.sort((a, b) => b - a)
  const docFrag = document.createDocumentFragment()
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  offsetX = offsetX || width - biggest - spacing - symbolWidth
  offsetY += symbolHeight / 4

  legend.setAttribute('data-name', 'legend')

  if (position === 'bottom') {
    height += Math.max(symbolHeight, VALUE_SIZE) + 5
  }

  labels.forEach((o, i) => {
    const symbol = createElement(
      'circle',
      offsetX + spacing,
      position === 'bottom' ? height - symbolHeight / 2 : offsetY,
      {
        r: symbolHeight / 2,
        style: {
          fill: o.color,
        },
      }
    )

    const btn = createElement(
      'rect',
      offsetX,
      position === 'bottom' ? height - symbolHeight / 2 : offsetY - 9,
      {
        style: {
          fill: '#000000',
          opacity: 0,
        },
      }
    )

    if (position === 'bottom') {
      offsetX += symbolWidth * 1.5
    }

    const label = createElement(
      'text',
      offsetX + (position === 'right' ? symbolWidth * 1.5 : 0),
      position === 'bottom' ? height - 2 : offsetY + 4,
      {
        style: {
          textAnchor: 'start',
          fontSize,
          lineHeight,
        },
      },
      o.name
    )

    btn.setAttribute('data-action', 'showInfo,click')
    btn.setAttribute('data-label', o.name)
    btn.setAttribute(
      'width',
      labelDimensions[i] + 40
    )
    btn.setAttribute('height', 18)

    if (position === 'bottom') {
      offsetX +=
        labelDimensions[i] + spacing
    }

    if (position === 'right') {
      offsetY += 18
    }

    legend.appendChild(symbol)
    legend.appendChild(label)
    legend.appendChild(btn)
  })

  docFrag.appendChild(legend)

  svg.appendChild(docFrag)

  try {
    return { bbox: legend.getBBox(), legend }
  } catch (err) {
    console.log(err)
    return { bbox: 0, legend }
  }
}