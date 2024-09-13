import { showHide, addListener, isType } from '@digitalbranch/u'
import Dispatcher from '@digitalbranch/dispatcher'
import {
  formatValue,
  norm,
  getDimensions,
  shade,
  tint,
  getMax,
  createElement,
  createText,
  createLegend,
} from '../utils'
import { FILTER, LEGEND_SIZE, VALUE_SIZE } from '../constants/constants'

export const bar = (data, options = {}, instance) => {
  const target =
    typeof options.target === 'string'
      ? document.getElementById(options.target)
      : options.target
  const axis = options.axis || {}
  // const labels = {
  //   x: axis.x ? axis.x.label : '',
  //   y: axis.y ? axis.y.label : ''
  // }
  const isStacked = options.isStacked === true
  const docFrag = document.createDocumentFragment()
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const PADDING = 20
  // const paddingLabel = options.axis && options.axis.x && options.axis.x.label ? 20 : 0
  const type = options.bars || 'vertical'
  const defaultColors = ['#004faf']
  const formatX = axis && axis.x ? axis.x.format || 'number' : 'number'
  const formatY = axis && axis.y ? axis.y.format || 'number' : 'number'
  const minValue = options.minValue || 0
  const maxValue = options.maxValue || getMax(data, null, isStacked)

  let HEIGHT = options.height || target.clientHeight
  let WIDTH = options.width || target.clientWidth

  const spacing = options.spacing === undefined ? 10 : options.spacing
  const gridLines = {
    x: {
      count:
        options.axis && options.axis.x && options.axis.x.gridLines
          ? options.axis.x.gridLines.count
          : 4,
    },
    y: {
      count:
        options.axis && options.axis.y && options.axis.y.gridLines
          ? options.axis.y.gridLines.count
          : 4,
    },
  }
  const offset = {
    x: PADDING,
    y: PADDING,
  }

  const columnCount = data.length

  const dispatcher = new Dispatcher()

  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

  const clipPathId = 'clip' + Math.round(Math.random(0, 10000) * 1000)

  const values = [0]

  const chart = {
    height: HEIGHT - PADDING * 2 - (VALUE_SIZE + 5),
    width: WIDTH - PADDING,
  }

  chartGroup.setAttribute('clip-path', `url(#${clipPathId}`)
  chartGroup.setAttribute('data-part', 'chart')

  svg.setAttribute('width', WIDTH)
  svg.setAttribute('height', HEIGHT)

  svg.appendChild(defs)

  // height -=
  //   options.legend && (options.legend.position === 'bottom' || !options.legend.position)
  //     ? 25
  //     : 0
  // height -= options.axis && options.axis.y && options.axis.y.label ? paddingLabel : 0
  // width -= options.axis && options.axis.x && options.axis.x.label ? paddingLabel : 0

  const createChartLabelY = (options, g) => {
    if (options.axis && options.axis.y) {
      const labelY = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      )

      options.axis.y.label = options.axis.y.label || ''
      labelY.textContent = options.axis.y.label

      g.appendChild(labelY)

      HEIGHT = labelY.getBBox().height

      chart.width -= HEIGHT

      labelY.setAttribute('y', chart.height / 2 + offset.y)
      labelY.setAttribute('x', HEIGHT + offset.x)
      labelY.setAttribute('text-anchor', 'middle')
      labelY.setAttribute(
        'transform',
        `rotate(-90 ${HEIGHT + offset.x} ${chart.height / 2 + offset.y})`
      )

      if (HEIGHT > 0) offset.x += HEIGHT + 10
    }
  }

  const createChartLabelX = (options, g) => {
    if (options.axis && options.axis.x) {
      const labelX = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      )

      options.axis.x.label = options.axis.x.label || ''
      labelX.textContent = options.axis.x.label

      labelX.classList.add('label')

      g.appendChild(labelX)

      const height = labelX.getBBox().height

      chart.height -= height + 10

      labelX.setAttribute(
        'y',
        chart.height + offset.y + height + 10 + VALUE_SIZE + 5
      )
      labelX.setAttribute('x', offset.x + chart.width / 2)
      labelX.setAttribute('text-anchor', 'middle')
    }
  }

  const createBars = (data) => {
    const props = {
      'font-size': `${VALUE_SIZE}px`,
      'font-family': 'inherit',
    }
    const bars = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const labels = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const spacingWidth =
      ((type === 'horizontal' ? chart.height : chart.width) / 100) * spacing

    let y = offset.y + (type === 'horizontal' ? 0 : 1)
    let x = offset.x + (type === 'horizontal' ? 1 : 0)

    const startX = x

    data.forEach((o, i) => {
      const values = o.value.filter((value) => !isType('String', value))
      const barsPerColumn = values.length
      const colors = options.colors ? options.colors : o.color || defaultColors
      const columnWidth =
        (100 / columnCount / (isStacked ? 1 : barsPerColumn) / 100) *
        ((type === 'horizontal' ? chart.height : chart.width) -
          (spacingWidth * columnCount + 1))

      if (type === 'horizontal') {
        x += 0
      } else {
        x += i === 0 ? spacingWidth / 2 : columnWidth + spacingWidth
      }

      const textX =
        type === 'horizontal'
          ? offset.x - 10
          : x + (columnWidth * (isStacked ? 1 : barsPerColumn)) / 2

      if (type === 'horizontal') {
        y += i === 0 ? spacingWidth / 2 : columnWidth + spacingWidth
      } else {
        y += 0
      }

      const textY =
        type === 'horizontal'
          ? y +
            columnWidth / 2 +
            getDimensions(formatValue(data[i].value[0], formatY), props, svg)
              .height /
              2
          : chart.height + PADDING + VALUE_SIZE + 5

      let prevColumnHeight = 0

      values.forEach((value, i) => {
        const normValue = norm(value, minValue, maxValue)
        const columnHeight = Math.round(
          normValue * (type === 'horizontal' ? chart.width : chart.height)
        )

        y = type === 'horizontal' ? y : chart.height - columnHeight + PADDING

        if (i > 0) {
          if (type === 'horizontal') {
            if (isStacked) {
              x += prevColumnHeight
            } else {
              y += columnWidth
            }
          } else {
            if (isStacked) {
              y -= prevColumnHeight
            } else {
              x += columnWidth
            }
          }
        }

        prevColumnHeight = columnHeight

        bars.appendChild(
          createBar(
            formatValue(value, type === 'horizontal' ? formatX : formatY),
            type === 'horizontal' ? columnWidth : columnHeight,
            type === 'horizontal' ? columnHeight : columnWidth,
            x,
            y,
            colors[i],
            barsPerColumn > 1 ? o.label[i] : o.label ? o.label[i] : o.value[0],
            [o.value[i], value]
          )
        )
      })

      if (type === 'horizontal' && isStacked) x = startX

      labels.appendChild(
        createText(
          formatValue(o.value[0], type === 'horizontal' ? formatY : formatX),
          textX,
          textY,
          type === 'horizontal' ? 'end' : 'middle',
          VALUE_SIZE
        )
      )
    })

    chartGroup.appendChild(bars)

    svg.appendChild(labels)
  }

  const createBar = (
    value,
    height = 0,
    width = 0,
    x,
    y,
    fill,
    label,
    values = []
  ) => {
    const bar = createElement('rect', x, y, {
      height,
      width,
      style: {
        fill,
        width: width + 'px',
        height: height + 'px',
      },
    })

    bar.info = {
      x,
      y,
      value,
      label,
      values,
    }

    bar.setAttribute('data-label', label)
    bar.setAttribute('data-action', 'showInfo,click')
    bar.setAttribute('data-type', 'bar')

    return bar
  }

  const drawLines = (numLines) => {
    const spacing = Math.round(
      (type === 'horizontal' ? chart.width : chart.height) / numLines
    )
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    let y = type === 'horizontal' ? PADDING : chart.height + PADDING
    let x = offset.x

    g.classList.add('lines')

    for (let i = 0; i < numLines + 1; i++) {
      const numLine = createElement('rect', x, y, {
        width: type === 'horizontal' ? 1 : chart.width,
        height: type === 'horizontal' ? chart.height : 1,
        style: {
          fill: i === 0 ? '#000000' : '#cccccc',
        },
      })

      if (type === 'horizontal') {
        x += spacing

        if (i === numLines) {
          numLine.setAttribute('x', Math.round(chart.width + offset.x) + 1)
        }
      } else {
        y -= spacing
      }

      g.appendChild(numLine)
    }
    chartGroup.appendChild(g)
  }

  const setValues = (numLines, min, max) => {
    const increment = Math.ceil(max / numLines)

    for (let i = 0; i < numLines; i++) {
      const cur = values[i] + increment

      values.push(cur > max ? max : cur)
    }
  }

  const setOffsetX = (data) => {
    if (type === 'horizontal') {
      offset.x +=
        (data
          .map(
            ({ value }) =>
              getDimensions(formatValue(value[0], formatY), {
                'font-size': `${VALUE_SIZE}px`,
                'font-family': 'inherit',
              }).width
          )
          .sort((a, b) => b - a)[0] || 0) + 10
    } else {
      offset.x += getDimensions(
        formatValue(values[values.length ? values.length - 1 : 0], formatY),
        {
          'font-family': 'inherit',
          'font-size': `${VALUE_SIZE}px`,
        }
      ).width
    }

    chart.width -= offset.x
    //chart.height -= LABEL_SIZE
  }

  const drawValues = (values) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const spacing =
      (type === 'horizontal' ? chart.width : chart.height) /
      (values.length ? values.length - 1 : 1)
    let y =
      type === 'horizontal'
        ? chart.height + PADDING + VALUE_SIZE + 5
        : chart.height + PADDING + (VALUE_SIZE - 2) / 2
    let x = offset.x

    values.forEach((value) => {
      g.appendChild(
        createText(
          formatValue(value, type === 'horizontal' ? formatX : formatY),
          x,
          y,
          type === 'horizontal' ? 'middle' : 'end',
          VALUE_SIZE
        )
      )

      if (type === 'vertical') {
        y -= spacing
      } else {
        x += spacing
      }
    })

    if (type === 'vertical') offset.x += 10

    svg.appendChild(g)
  }

  const showInfo = (target) => {
    const node = target
    const parent = svg

    const textNode = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )
    const nodeX = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'tspan'
    )
    const nodeY = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'tspan'
    )
    const valueNodeY = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'tspan'
    )
    const valueNodeX = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'tspan'
    )
    const info = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const docFrag = document.createDocumentFragment()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    const widthBar = target.getBBox().width

    let height = 45
    let width = 0

    target.tip = info

    textNode.setAttribute(
      'y',
      node.info.y - height < 0 ? node.info.y + 18 : node.info.y - 26
    )
    textNode.setAttribute('text-anchor', 'start')

    valueNodeX.classList.add('value-x')
    valueNodeY.classList.add('value-y')

    valueNodeX.textContent = node.info.value
    valueNodeY.textContent = node.info.label

    valueNodeX.style.fontWeight = 'bold'

    info.style.pointerEvents = 'none'

    nodeY.appendChild(valueNodeY)
    nodeX.appendChild(valueNodeX)

    nodeY.setAttribute('dy', 20)

    info.appendChild(rect)
    info.appendChild(textNode)

    textNode.appendChild(nodeX)
    textNode.appendChild(nodeY)

    docFrag.appendChild(info)

    info.classList.add('info')

    parent.appendChild(docFrag)

    width = Math.max(
      getDimensions(nodeX.textContent, {
        'font-size': window.getComputedStyle(nodeX).fontSize,
        'font-family': window.getComputedStyle(nodeX).fontFamily,
        'text-transform': window.getComputedStyle(nodeX).textTransform,
      }).width,

      getDimensions(nodeY.textContent, {
        'font-size': window.getComputedStyle(nodeX).fontSize,
        'font-family': window.getComputedStyle(nodeX).fontFamily,
        'text-transform': window.getComputedStyle(nodeX).textTransform,
      }).width
    )

    textNode.setAttribute(
      'x',
      node.info.x + widthBar + width + 22 > chart.width + offset.x + PADDING
        ? node.info.x -
            (width + 20) +
            (type === 'horizontal' ? widthBar + 2 : 0)
        : node.info.x + 14 + widthBar
    )

    nodeY.setAttribute(
      'x',
      node.info.x + widthBar + width + 22 > chart.width + offset.x + PADDING
        ? node.info.x -
            (width + 20) +
            (type === 'horizontal' ? widthBar + 2 : 0)
        : node.info.x + 14 + widthBar
    )

    rect.setAttribute('width', width + 20)
    rect.setAttribute('height', height)
    rect.setAttribute(
      'x',
      node.info.x + widthBar + width + 22 > chart.width + offset.x + PADDING
        ? node.info.x -
            (width + 25) +
            (type === 'horizontal' ? widthBar + 2 : 0)
        : node.info.x + widthBar + 5
    )
    rect.setAttribute(
      'y',
      node.info.y - height < 0 ? node.info.y : node.info.y - height
    )

    rect.style.fill = '#ffffff'
    rect.style.stroke = 'hsla(0, 0%, 90%, 1)'

    showHide(textNode, {
      action: 'show',
      style: 'fade',
    })
  }

  const hideInfo = (target) => {
    const parent = svg
    const info = target.tip || null

    if (info) parent.removeChild(info)
  }

  docFrag.appendChild(svg)

  target.appendChild(docFrag)

  if (options.legend) {
    const bbox = createLegend(
      options.legend,
      0,
      PADDING,
      WIDTH - PADDING,
      HEIGHT,
      svg,
      LEGEND_SIZE,
      LEGEND_SIZE,
      VALUE_SIZE
    ).bbox

    chart.width -= options.legend.position === 'right' ? bbox.width : 0
  }

  setValues(
    type === 'horizontal' ? gridLines.x.count : gridLines.y.count,
    minValue,
    maxValue
  )

  const labelsEl = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  labelsEl.classList.add('labels')

  svg.appendChild(labelsEl)

  createChartLabelY(options, labelsEl)

  setOffsetX(data)

  createChartLabelX(options, labelsEl)

  drawValues(values)

  drawLines(type === 'horizontal' ? gridLines.x.count : gridLines.y.count)

  createBars(data)

  dispatcher.addEvents(
    {
      event: 'showInfo',
      callback: (e, target) => {
        if (e.type === 'mouseover') {
          if (
            target.parentNode.nodeName === 'g' &&
            target.parentNode.getAttribute('data-name') === 'legend'
          ) {
            target.setAttribute('data-action', 'hideInfo,click')
            target = svg.querySelectorAll(
              `[data-part='chart'] rect[data-label='${target.getAttribute(
                'data-label'
              )}']`
            )
          } else {
            target = [target]
          }

          for (const o of target) {
            o.orgColor = o.style.fill

            o.style.fill = tint(shade(o.style.fill, 0.08), -0.2)
            o.style.filter = 'url(#dropshadow)'

            o.parentNode.appendChild(o)

            o.setAttribute('data-action', 'hideInfo,click')

            showInfo(o)
          }
        }
      },
    },
    {
      event: 'hideInfo',
      callback: (e, target) => {
        if (e.type === 'mouseout') {
          if (
            target.parentNode.nodeName === 'g' &&
            target.parentNode.getAttribute('data-name') === 'legend'
          ) {
            target.setAttribute('data-action', 'showInfo,click')
            target = svg.querySelectorAll(
              `[data-part='chart'] rect[data-label='${target.getAttribute(
                'data-label'
              )}']`
            )
          } else {
            target = [target]
          }

          for (const o of target) {
            o.setAttribute('data-action', 'showInfo,click')

            o.style.fill = o.orgColor
            o.style.filter = null

            hideInfo(o)
          }
        }
      },
    },
    {
      event: 'click',
      callback({ type }, target) {
        if (type === 'click' && target) instance.emit('click', target.info)
      },
    }
  )

  addListener(svg, 'mouseover', dispatcher.dispatch, false)
  addListener(svg, 'mouseout', dispatcher.dispatch, false)
  addListener(svg, 'click', dispatcher.dispatch)

  defs.insertAdjacentHTML('afterbegin', FILTER)
  defs.insertAdjacentHTML(
    'beforeend',
    `<clipPath id='${clipPathId}'>
      <rect x='${offset.x}' y='${PADDING - 1}' width='${
      chart.width + 2
    }' height='${Math.max(
      chart.height + (type === 'vertical' ? 2 : 0),
      0
    )}'></rect>
    </clipPath>`
  )

  svg.append(chartGroup)

  return {
    target,
    svg,
  }
}
