export const tint = (color, m) => {
  if (!m) {
    return false
  }
  if (color.indexOf('rgb') > -1) {
    color =
      'rgb' +
      '(' +
      color
        .replace(/[A-z() ]/g, '')
        .split(',')
        .map(c => {
          c = parseInt(c, 10)
          return Math.floor(c + (255 - c) * m)
        })
        .join(',') +
      ')'
  } else if (color.indexOf('#') > -1) {
  } else if (color.indexOf('hsl') > -1) {
  }
  return color
}