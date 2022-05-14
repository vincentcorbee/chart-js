export const createElement = (name, x, y, attributes, content) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name)

  if (x) {
    element.setAttribute(name === 'circle' ? 'cx' : 'x', x)
  }

  if (y) {
    element.setAttribute(name === 'circle' ? 'cy' : 'y', y)
  }

  if (name === 'text' && content) {
    element.textContent = content
  }

  if (attributes) {
    for (const attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        const value = attributes[attr]

        if (attr === 'style') {
          for (const style in value) {
            if (value.hasOwnProperty(style)) {
              element.style[style] = value[style]
            }
          }
        } else {
          element.setAttribute(attr, value < 0 ? 0 : value)
        }
      }
    }
  }

  return element
}