export const formatAmount = (amount, lang = 'nl-NL') => {
  const formatter = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })

  return formatter.format(amount)
}