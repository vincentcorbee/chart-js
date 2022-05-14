import { formatDate } from './format-date'
import { formatAmount } from './format-amount'

export const formatValue = (value, format, lang = 'nl-NL') => {
  switch (format) {
    case 'currency':
      return formatAmount(value, lang)
    case 'percentage':
      return `${value.toLocaleString(lang)}%`
    case 'date':
      return formatDate(value, false, lang)
  }

  return value.toLocaleString(lang)
}