export const formatDate = (date, time = true, lang = 'nl-NL') =>
  (
    `${new Intl.DateTimeFormat(lang, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date)}` +
    (time
      ? ` ${new Intl.DateTimeFormat(lang, {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        }).format(date)}`
      : '')
  )
