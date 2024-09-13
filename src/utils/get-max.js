import { roundTo } from '@digitalbranch/u'

export const getMax = (data, axis, isStacked = false) =>
  data
    .flatMap((o) => {
      let value = o.value.filter((value) => typeof value !== 'string')

      if (axis) value = value.map((arr) => arr[axis === 'x' ? 0 : 1])

      let v = isStacked
        ? value.reduce((acc, cur) => acc + cur, 0)
        : value.sort((a, b) => b - a)[0] ?? 0

      const result = roundTo(v, 2)

      return result !== null && result !== undefined ? [result] : []
    })
    .sort((a, b) => b - a)[0] ?? 0
