import {
  mix,
} from '@digitalbranch/u'
import Emitter from '@digitalbranch/emitter'

import charts from './charts'

class Chart {
  constructor(data, options) {
    const chart = charts[options.type || 'bar'](data, options, this)

    mix(this, Emitter)

    this.data = data
    this.options = options
    this.target = chart.target
    this.svg = chart.svg

    this.svg.classList.add('chart')
  }

  setWidth(width) {
    let options = this.options

    this.options.width = width
    this.refresh(null, options)

    return this
  }

  setHeight(height) {
    let options = this.options

    this.options.height = height
    this.refresh(null, options)

    return this
  }

  refresh(data, options) {
    this.data = data || this.data
    this.options = options || this.options
    this.target.innerHTML = ''
    this.svg = null

    let chart = charts[this.options.type || 'bar'](this.data, this.options)

    this.target = chart.target
    this.svg = chart.svg

    return this
  }
}

export default Chart