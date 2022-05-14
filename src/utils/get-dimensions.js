export const getDimensions = (input = '', config = {}, svg) => {
  const dum = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  let dim

  dum.style.position = 'absolute'
  dum.style.visibility = 'hidden'

  if (typeof input === 'string') {
    dum.textContent = input

    Object.entries(config).forEach(([key, val]) => dum.style[key] = val)
  } else if (input.nodeType) {
    dum.appendChild(input)
  }

  if (!svg) {
    svg = svg || document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    svg.appendChild(dum)

    svg.style.position = 'absolute'
    svg.style.visibility = 'hidden'

    document.body.appendChild(svg)

    dim = dum.getBBox()

    document.body.removeChild(svg)
  } else {
    svg.appendChild(dum)

    dim = dum.getBBox()

    svg.removeChild(dum)
  }

  return dim
}
