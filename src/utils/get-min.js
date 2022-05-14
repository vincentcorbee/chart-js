import { roundTo } from '@digitalbranch/u'

export const getMin = (data, axis) =>
  data
    .map(o => {
      let value = o.value.filter(value => typeof value !== 'string')

      if (axis) {
        value = value.map(arr => arr[axis === 'x' ? 0 : 1])
      }

      let v = value.sort((a, b) => a - b)[0] || 0

      return roundTo(v, 2)
    })
    .filter(val => val !== null && val !== undefined)
    .sort((a, b) => a - b)[0] || 0