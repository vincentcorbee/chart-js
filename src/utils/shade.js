export const shade = (color, m) => {
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
        .map(c => Math.floor(parseInt(c, 10) * (1 - m)))
        .join(',') +
      ')'
  } else if (color.indexOf('#') > -1) {
  } else if (color.indexOf('hsl') > -1) {
  }

  return color
}