import {
  showHide,
  roundTo,
} from '@digitalbranch/u'
import Dispatcher from '@digitalbranch/dispatcher'
import { formatValue, norm, getDimensions, getMax, getMin, createElement, createText, createLegend } from '../utils'
import { FILTER, LEGEND_SIZE, VALUE_SIZE } from '../constants/constants'

export const line = (data, options = {}, instance) => {
  let dispatcher
  const target =
    typeof options.target === 'string'
      ? document.getElementById(options.target)
      : options.target
  const docFrag = document.createDocumentFragment()
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const count = data.map(obj => obj.value.length).sort((a, b) => a - b)[0] - 1 || 0
  const numLinesX = count < 3 ? count : 3
  const numLinesY = count < 3 ? count : 3
  const minValues = {
    y:
      options.axis && options.axis.y && options.axis.y.min !== undefined
        ? options.axis.y.min
        : getMin(data, 'y'),
    x:
      options.axis && options.axis.x && options.axis.x.min !== undefined
        ? options.axis.x.min
        : getMin(data, 'x'),
  }
  const maxValues = {
    y:
      options.axis && options.axis.y && options.axis.y.max
        ? options.axis.y.max
        : getMax(data, 'y'),
    x:
      options.axis && options.axis.x && options.axis.x.max
        ? options.axis.x.max
        : getMax(data, 'x'),
  }
  const dimensions = {
    y: options.height || target.clientHeight,
    x: options.width || target.clientWidth,
  }
  const padding = 30
  const chart = {
    width: 0,
    height: dimensions.y - padding * 2,
  }
  const offset = {
    x: 0,
    y: 0,
  }
  const labelSize = 11
  const clipPathId = 'clip' + Math.round(Math.random(0, 10000) * 1000)
  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

  chartGroup.setAttribute('data-part', 'chart')
  chartGroup.setAttribute('clip-path', `url(#${clipPathId}`)

  svg.appendChild(defs)
  svg.setAttribute('width', dimensions.x)
  svg.setAttribute('height', dimensions.y)

  const showInfo = node => {
    let width = 0

    const parent = svg
    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const nodeX = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const nodeY = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const valueNodeY = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const valueNodeX = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const info = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const docFrag = document.createDocumentFragment()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const height = 42
    const symbolX =
      options.axis && options.axis.x && options.axis.x.numberType === 'percentage'
        ? '%'
        : ''
    const symbolY =
      options.axis && options.axis.y && options.axis.y.numberType === 'percentage'
        ? '%'
        : ''

    node.tip = info

    textNode.setAttribute(
      'y',
      node.info.y - 50 - height < 0 ? node.info.y + 26 : node.info.y - 34
    )
    textNode.setAttribute('text-anchor', 'start')

    valueNodeX.textContent =
      formatValue(node.info.values.x, node.info.axis.x.format) + symbolX
    valueNodeY.textContent =
      formatValue(node.info.values.y, node.info.axis.y.format) + symbolY
    valueNodeX.style.fontWeight = 'bold'
    valueNodeY.style.fontWeight = 'bold'

    info.style.pointerEvents = 'none'

    nodeX.textContent = node.info.axis.x.label + ': '
    nodeY.textContent = node.info.axis.y.label + ': '

    nodeY.appendChild(valueNodeY)
    nodeX.appendChild(valueNodeX)

    nodeY.setAttribute('dy', 17)
    textNode.appendChild(nodeX)
    textNode.appendChild(nodeY)

    info.appendChild(rect)
    info.appendChild(textNode)

    docFrag.appendChild(info)
    parent.appendChild(docFrag)

    width = Math.max(
      getDimensions(nodeX.textContent, {
        'font-size': window.getComputedStyle(nodeX).fontSize,
        'font-family': window.getComputedStyle(nodeX).fontFamily,
        'text-transform': window.getComputedStyle(nodeX).textTransform,
      }).width,
      getDimensions(nodeY.textContent, {
        'font-size': window.getComputedStyle(nodeY).fontSize,
        'font-family': window.getComputedStyle(nodeY).fontFamily,
        'text-transform': window.getComputedStyle(nodeY).textTransform,
      }).width
    )

    textNode.setAttribute(
      'x',
      node.info.x + width + 22 > parent.clientWidth
        ? node.info.x - (width + 22)
        : node.info.x + 14
    )
    nodeY.setAttribute(
      'x',
      node.info.x + width + 22 > parent.clientWidth
        ? node.info.x - (width + 22)
        : node.info.x + 14
    )

    rect.setAttribute('width', width + 20)
    rect.setAttribute('height', height)
    rect.setAttribute(
      'x',
      node.info.x + width + 22 > parent.clientWidth
        ? node.info.x - (width + 27)
        : node.info.x + 5
    )
    rect.setAttribute(
      'y',
      node.info.y - 50 - height < 0 ? node.info.y + 8 : node.info.y - 50
    )
    rect.style.fill = '#ffffff'
    rect.style.stroke = 'hsla(0, 0%, 90%, 1)'

    showHide(textNode, {
      action: 'show',
      style: 'fade',
    })
  }

  const hideInfo = node => {
    const info = node.tip || null

    if (info) {
      svg.removeChild(info)
    }
  }

  const drawValues = (numLinesX, numLinesY, min, max) => {
    for (const axis in max) {
      if (max.hasOwnProperty(axis)) {
        const numLines = axis === 'x' ? numLinesX : numLinesY
        const increment = roundTo((max[axis] - min[axis]) / numLines, 1)
        let spacing
        let y = dimensions.y - padding + (labelSize - 2) / 2
        let x = 0
        const format =
          options.axis && options.axis[axis] ? options.axis[axis].format : 'number'
        const values = [min[axis]]
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

        for (let i = 0; i < numLines; i++) {
          values.push(
            values[i] + increment > max[axis] ? max[axis] : values[i] + increment
          )
        }

        if (axis === 'y') {
          x =
            values
              .map(
                value =>
                  getDimensions(formatValue(value, format), {
                    'font-size': `${labelSize}px`,
                    'font-family': 'inherit',
                  }).width
              )
              .sort((a, b) => b - a)[0] +
            padding / 2
        }

        if (axis === 'x') {
          y += 12

          offset.y = y + 12
        }

        if (axis === 'y') {
          chart.width += dimensions.x - x - 10 - padding

          offset.x = x + 10
        }

        spacing = (axis === 'x' ? chart.width : chart.height) / numLines

        values.forEach(value => {
          g.appendChild(
            createText(
              formatValue(value, format),
              axis === 'x' ? x + offset.x : x,
              y,
              axis === 'y' ? 'end' : 'middle',
              labelSize
            )
          )

          if (axis === 'y') {
            y -= spacing
          } else {
            x += spacing
          }
        })

        svg.appendChild(g)
      }
    }
  }
  const drawDiagram = () => {
    data.forEach(o => {
      const values = o.value
      const path = createElement('path', null, null, {
        style: {
          stroke: o.color || '#000',
          fill: 'none',
        },
      })
      const labelX = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      const labelY = document.createElementNS('http://www.w3.org/2000/svg', 'text')

      let lengthPath

      labelX.textContent = options.axis.x.label
      labelX.setAttribute('y', chart.height + padding + 30)
      labelX.setAttribute('x', chart.width / 2 + offset.x)
      labelX.setAttribute('text-anchor', 'middle')
      labelX.classList.add('label')
      labelY.textContent = options.axis.y.label
      labelY.setAttribute('y', chart.height / 2 + padding)
      labelY.setAttribute('x', 10)
      labelY.setAttribute('text-anchor', 'middle')
      labelY.setAttribute('transform', `rotate(-90 10 ${chart.height / 2 + padding})`)
      labelY.classList.add('label')

      svg.appendChild(labelX)
      svg.appendChild(labelY)

      path.style.strokeWidth = '2px'

      chartGroup.appendChild(path)

      values.forEach((value, i) => {
        const normX = norm(value[0], minValues.x, maxValues.x)
        const normY = norm(value[1], minValues.y, maxValues.y)
        const btn = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

        const y = padding + (chart.height - Math.round(normY * chart.height)) - 1
        const x = offset.x + Math.round(normX * chart.width)

        if (i === 0) {
          path.setAttribute('d', `M ${offset.x + 1} ${y}`)
        } else {
          path.setAttribute('d', `${path.getAttribute('d')} L ${x} ${y}`)
        }

        btn.style.fill = o.color
        btn.style.opacity = 1

        btn.setAttribute('r', 3)
        btn.setAttribute('cx', x)
        btn.setAttribute('cy', y)
        btn.setAttribute('cx', x)
        btn.setAttribute('data-value', value)
        btn.setAttribute('data-label', o.label)

        btn.info = {
          x,
          y,
          values: {
            x: value[0],
            y: value[1],
          },
          axis: options.axis || null,
        }

        // btn.style.filter = 'url(#dropshadow)'

        btn.setAttribute('data-action', 'showInfo,click')

        chartGroup.appendChild(btn)
      })

      if (options.animate) {
        lengthPath = path.getTotalLength()
        path.style.strokeDasharray = lengthPath
        path.style.strokeDashoffset = lengthPath
      }
    })
  }
  const drawLines = (numLinesX = 1, numLinesY = 1) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    let spacing = Math.round(chart.height / numLinesY)
    let offsetY = chart.height + padding

    for (let i = 0; i < numLinesY + 1; i++) {
      const numLine = createElement('rect', offset.x, offsetY - 1, {
        width: chart.width,
        height: 1,
        style: {
          fill: i === 0 ? '#000000' : '#dfdfdf',
        },
      })

      offsetY -= spacing

      g.appendChild(numLine)
    }

    spacing = (chart.width - 1) / numLinesX
    offsetY = padding - 1

    let offsetX = offset.x

    for (let i = 0; i < numLinesX + 1; i++) {
      const numLine = createElement('rect', offsetX, offsetY, {
        height: chart.height,
        width: 1,
        style: {
          fill: i === 0 ? '#000000' : '#dfdfdf',
        },
      })

      offsetX += spacing

      g.appendChild(numLine)
    }

    chartGroup.appendChild(g)
  }

  svg.appendChild(chartGroup)

  docFrag.appendChild(svg)

  target.appendChild(docFrag)

  if (options.legend) {
    let bbox = createLegend(options.legend, 0, padding, dimensions.x, chart.height, svg, LEGEND_SIZE, LEGEND_SIZE, VALUE_SIZE)
      .bbox
    chart.width -= options.legend.position === 'right' ? bbox.width - padding : 0
  }

  drawValues(numLinesX, numLinesY, minValues, maxValues)

  drawLines(numLinesX, numLinesY)

  drawDiagram()

  defs.insertAdjacentHTML('afterbegin', FILTER)
  defs.insertAdjacentHTML(
    'beforeend',
    `<clipPath id='${clipPathId}'>
    <rect x='${offset.x - 3}' y='${padding - 4}' width='${
      (chart.width < 0 ? 0 : chart.width) + 6
    }' height='${(chart.height < 0 ? 0 : chart.height) + 6}'></rect>
  </clipPath>`
  )

  dispatcher = new Dispatcher(
    {
      event: 'showInfo',
      callback: (e, target) => {
        if (
          target.parentNode.nodeName === 'g' &&
          target.parentNode.getAttribute('data-name') === 'legend'
        ) {
          target.setAttribute('data-action', 'hideInfo,click')
          target = svg.querySelectorAll(
            `[data-part="chart"] circle[data-label="${target.getAttribute(
              'data-label'
            )}"]`
          )
        } else {
          target = [target]
        }

        for (const o of target) {
          o.setAttribute('data-action', 'hideInfo,click')

          o.style.opacity = 1

          showInfo(o)
        }
      },
    },
    {
      event: 'hideInfo',
      callback: (e, target) => {
        if (
          target.parentNode.nodeName === 'g' &&
          target.parentNode.getAttribute('data-name') === 'legend'
        ) {
          target.setAttribute('data-action', 'showInfo,click')
          target = svg.querySelectorAll(
            `[data-part="chart"] circle[data-label="${target.getAttribute(
              'data-label'
            )}"]`
          )
        } else {
          target = [target]
        }

        for (const o of target) {
          o.setAttribute('data-action', 'showInfo,click')
          // target.style.opacity = 0
          hideInfo(o)
        }
      },
    }
  )

  svg.addEventListener('mouseover', dispatcher.dispatch, false)
  svg.addEventListener('mouseout', dispatcher.dispatch, false)

  return {
    target,
    svg,
  }
}