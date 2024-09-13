import {
  animate,
  showHide,
} from '@digitalbranch/u'
import Dispatcher from '@digitalbranch/dispatcher'
import { genColor, formatValue, getDimensions, createLegend } from '../utils'
import { FILTER, LEGEND_SIZE, VALUE_SIZE } from '../constants/constants'

const getPos = (centerX, centerY, part, r) => ({
  x: (centerX + Math.cos((part * Math.PI) / 180) * r) || 0,
  y: (centerY + Math.sin((part * Math.PI) / 180) * r) || 0,
})

export const pie = (data, options = {}, instance) => {
  const showInfo = target => {
    let parent = svg
    let label
    let value
    let width

    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const labelNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const valueNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const docFrag = document.createDocumentFragment()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const {
      info: { x, y },
    } = target

    // circle = rect = document.createElementNS('http://www.w3.org/2000/svg','circle')
    rect.classList.add('info')

    target.setAttribute('data-action', 'hideInfo,click')

    value = target.getAttribute('data-value')
    label = target.getAttribute('data-label')

    target.previousElementSibling.style.opacity = 0.3

    target.tip = tip

    textNode.setAttribute('x', x + (x > centerX ? 10 : -10))
    textNode.setAttribute('y', y + (y > centerY ? 18 : -24))
    textNode.setAttribute('text-anchor', x > centerX ? 'start' : 'end')

    labelNode.textContent = label
    valueNode.textContent = value + (numberType === 'percentage' ? '%' : '')

    valueNode.setAttribute('dy', 15)
    valueNode.setAttribute('x', x + (x > centerX ? 10 : -10))

    labelNode.id = 'label'
    valueNode.id = 'value'
    textNode.id = 'info'
    // circle.setAttribute('cx', node.pos.x)
    // circle.setAttribute('cy', node.pos.y)
    // circle.setAttribute('r', 10)
    // circle.style.fill = 'red'

    textNode.appendChild(labelNode)
    textNode.appendChild(valueNode)

    tip.appendChild(rect)
    tip.appendChild(textNode)

    docFrag.appendChild(tip)

    parent.appendChild(docFrag)

    width = Math.max(
      getDimensions(label, {
        'font-size': window.getComputedStyle(labelNode).fontSize,
        'font-family': window.getComputedStyle(labelNode).fontFamily,
        'text-transform': window.getComputedStyle(labelNode).textTransform,
      }).width,
      getDimensions(value, {
        'font-size': window.getComputedStyle(valueNode).fontSize,
        'font-family': window.getComputedStyle(valueNode).fontFamily,
        'text-transform': window.getComputedStyle(valueNode).textTransform,
      }).width
    )

    rect.setAttribute('width', width + 20)
    rect.setAttribute('height', 42)
    rect.setAttribute('x', x - (x > centerX ? 0 : width + 20))
    rect.setAttribute('y', y - (y > centerY ? -0 : 42))

    rect.style.fill = '#ffffff'
    rect.style.stroke = 'hsla(0, 0%, 90%, 1)'

    tip.style.pointerEvents = 'none'
    // parent.appendChild(circle)

    showHide(textNode, {
      action: 'show',
      style: 'fade',
    })
  }

  const hideInfo = target => {
    const parent = svg
    const tip = target.tip

    target.setAttribute('data-action', 'showInfo,click')
    target.previousElementSibling.style.opacity = 0

    if (tip) {
      parent.removeChild(tip)
    }
  }

  const target =
    typeof options.target === 'string'
      ? document.getElementById(options.target)
      : options.target
  // let labelSize = 11
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  const docFrag = document.createDocumentFragment()
  const hole = options.hole || 0
  // hier klopt niks van
  // if stroked, pie with hole breaks
  const r = options.radius
  const rOuter = options.radius + 7
  const circumference = 2 * Math.PI * r
  const stroked = options.stroked !== undefined ? options.stroked : false
  const numberType = options.numberType ? options.numberType : 'integer'
  const centerX =
    target.clientWidth /
    2 /
    (options.legend && options.legend.position === 'right' ? 1.15 : 1)
  const centerY = target.clientHeight / 2

  let total = 0
  let totalDeg = -90
  let x = centerX
  let y = getPos(centerX, centerY, totalDeg, hole ? (r + hole) / 2 : r).y
  let xOuter = centerX
  let yOuter = getPos(centerX, centerY, totalDeg, hole ? (rOuter + hole) / 2 : rOuter).y
  let dispatcher

  svg.id = 'pie'

  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')

  total = data.reduce(
    (acc, el) =>
      (acc += typeof el.value !== 'string' ? el.value : parseInt(el.value, 10)),
    0
  )

  data.forEach((el, i) => {
    const { value, label } = el
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const outerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const part = (360 / 100) * ((value / total) * 100) || 0
    const curPos = getPos(centerX, centerY, totalDeg + part, hole ? (r + hole) / 2 : r)
    const posOuter = getPos(
      centerX,
      centerY,
      totalDeg + part,
      hole ? (rOuter + hole) / 2 : rOuter
    )
    const color = el.color || options.colors[i] || genColor()
    const d =
      `M ${hole ? x : centerX} ${hole ? y : centerY}` +
      (hole ? '' : `L ${x} ${y}`) +
      ` A ${hole ? (r + hole) / 2 : r} ${hole ? (r + hole) / 2 : r} 0 ${
        part > 180 ? 1 : 0
      } 1 ${curPos.x * (part === 360 ? 0.999 : 1)} ${
        curPos.y * (part === 360 ? 0.999 : 1)
      }` +
      (stroked ? ` L ${centerX} ${centerY}` : '' + `${part === 360 ? ' Z' : ''}`)

    el.color = color

    path.info = {
      ...getPos(centerX, centerY, totalDeg + part / 2, r),
      value,
      label,
    }

    path.setAttribute('d', d)

    path.style.fill = hole ? 'none' : color

    path.setAttribute('data-action', 'showInfo,click')

    if (hole) {
      path.style.stroke = color
      path.style.strokeWidth = r - hole
    }

    outerPath.setAttribute(
      'd',
      `M ${hole ? xOuter : centerX} ${hole ? yOuter : centerY}` +
        (hole ? '' : `L ${xOuter} ${yOuter}`) +
        ` A ${hole ? (rOuter + hole) / 2 : rOuter} ${
          hole ? (rOuter + hole) / 2 : rOuter
        } 0 ${part > 180 ? 1 : 0} 1 ${posOuter.x * (part === 360 ? 0.999 : 1)} ${
          posOuter.y * (part === 360 ? 0.999 : 1)
        }${part === 360 ? ' Z' : ''}`
    )

    outerPath.style.fill = hole ? 'none' : color
    outerPath.style.opacity = 0

    if (hole) {
      outerPath.style.stroke = color
      outerPath.style.strokeWidth = rOuter - hole
    }

    outerPath.classList.add('outer')

    if (stroked && !hole) {
      path.setAttribute('stroke-width', 1)
      path.style.stroke = '#ffffff'
    }

    path.setAttribute('data-label', label)
    path.setAttribute('data-value', formatValue(value, options.format || 'integer'))

    svg.appendChild(outerPath)
    svg.appendChild(path)

    x = curPos.x
    y = curPos.y

    xOuter = posOuter.x
    yOuter = posOuter.y

    totalDeg += part
  })

  if (options.animate) {
    overlay.setAttribute('r', r)
    overlay.setAttribute('cx', centerX)
    overlay.setAttribute('cy', centerY)

    overlay.style.fill = 'none'
    overlay.style.stroke = 'hsl(80,0%, 100%)'

    overlay.setAttribute('stroke-width', r * 2)
    overlay.setAttribute('stroke-dashoffset', 0)
    overlay.setAttribute('stroke-dasharray', circumference + ' ' + circumference)

    svg.appendChild(overlay)

    animate({
      fn: step => overlay.setAttribute('stroke-dashoffset', -(circumference * step)),
    })
  }

  svg.insertAdjacentHTML('afterbegin', FILTER)

  dispatcher = new Dispatcher(
    {
      event: 'showInfo',
      callback(e, target) {
        if (
          target.parentNode.nodeName === 'g' &&
          target.parentNode.getAttribute('data-name') === 'legend'
        ) {
          target.setAttribute('data-action', 'hideInfo,click')
          target = svg.querySelector(
            `path[data-label='${target.getAttribute('data-label')}']`
          )
        }

        svg.removeEventListener('mouseover', dispatcher.dispatch, false)

        showInfo(target)

        svg.addEventListener('mouseout', dispatcher.dispatch, false)
      },
    },
    {
      event: 'hideInfo',
      callback(e, target) {
        if (
          target.parentNode.nodeName === 'g' &&
          target.parentNode.getAttribute('data-name') === 'legend'
        ) {
          target.setAttribute('data-action', 'showInfo,click')
          target = svg.querySelector(
            `path[data-label='${target.getAttribute('data-label')}']`
          )
        }

        svg.removeEventListener('mouseout', dispatcher.dispatch, false)

        hideInfo(target)

        svg.addEventListener('mouseover', dispatcher.dispatch, false)
      },
    },
    {
      event: 'click',
      callback(e, target) {
        if (e.type === 'click')
          instance.emit('click', target.info)

      },
    }
  )

  if (options.legend) {
    createLegend(
      options.legend,
      target.clientWidth / 2 + r,
      r / 2,
      target.clientWidth,
      target.clientHeight,
      svg,
      LEGEND_SIZE,
      LEGEND_SIZE,
      VALUE_SIZE
    )
  }

  docFrag.appendChild(svg)
  target.appendChild(docFrag)

  svg.addEventListener('mouseover', dispatcher.dispatch, false)
  svg.addEventListener('click', dispatcher.dispatch, false)
  // svg.addEventListener('mouseout', dispatcher.dispatch, false)

  return {
    target,
    svg,
  }
}