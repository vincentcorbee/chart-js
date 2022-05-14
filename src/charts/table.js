import { CustomScrollbars } from "@digitalbranch/ui"
import { createNewElement, append, leadingZero } from '@digitalbranch/u'

export const table = (data, options = {}) => {
  let target =
    typeof options.target === 'string'
      ? document.getElementById(options.target)
      : options.target
  let docFrag = document.createDocumentFragment()
  let container = createNewElement('div', ['class=container'])
  let sorting = options.sorting || {
    type: null,
    order: 'desc',
  }
  let dispatcher

  const sortRecords = (sorting, type, records, column) => {
    let flat = records.reduce((a, b) => a.concat(b[column]), [])

    if (type === 'string') {
      flat.sort((a, b) => {
        if (sorting === 'desc') {
          return b.localeCompare(a)
        } else {
          return a.localeCompare(b)
        }
      })
    } else if (type === 'date') {
      flat.sort((a, b) => {
        a = new Date(a)
        b = new Date(b)

        if (sorting === 'desc') {
          return b - a
        } else {
          return a - b
        }
      })
    } else {
      flat.sort((a, b) => {
        if (sorting === 'desc') {
          return parseInt(b) - parseInt(a)
        } else {
          return parseInt(a) - parseInt(b)
        }
      })
    }

    records.forEach((record, i) => (record[column] = flat[i]))

    return records
  }

  const createTable = () => {
    let docFrag = createNewElement('documentFragment')
    let head = createNewElement('div', ['class=headers'])
    let footer = createNewElement('div', ['class=footer'])
    let body = createNewElement('div', [
      'class=body scrollableContent',
      'data-scroll=y',
    ])
    let headers = options.columns

    container.innerHTML = ''

    headers.forEach((header, i) => {
      let div = createNewElement('div', ['class=heading', 'data-name=' + header[0]])
      let btn = createNewElement('button', [
        'type=button',
        'content=' + header[0],
        'data-action=sort',
        'data-type=' + (header[1] || 'string'),
        'data-column=' + i,
      ])

      if (sorting.type === header) {
        btn.setAttribute('aria-pressed', true)
        btn.classList.add(sorting.order)
        btn.setAttribute('data-sorting', sorting.order)
      }

      append(head, append(div, btn))
    })

    head.addEventListener('click', dispatcher.dispatch, false)

    append(docFrag, head, body)

    if (options.footer !== false) {
      append(docFrag, footer)
    }

    append(target, append(container, docFrag))

    insertRecords(data)

    if (options.footer !== false) {
      // App.insertTotals(App.filterRecords())
    }

    CustomScrollbars.create(body)
  }
  const insertRecords = data => {
    let body = container.querySelector('.body')

    body.innerHTML = ''
    data.forEach(value => {
      let row = createNewElement('div', ['class=row'])

      value.forEach((value, i) => {
        let type = options.columns[i][1] || 'string'
        let v = type !== 'date' ? value : new Date(Date.parse(value))
        let node = createNewElement('div', [
          'content=' +
            (type !== 'date'
              ? v
              : leadingZero(v.getDate()) +
                '-' +
                leadingZero(v.getMonth() + 1) +
                '-' +
                v.getFullYear() +
                ' ' +
                (leadingZero(v.getHours()) || '00') +
                ':' +
                (leadingZero(v.getMinutes()) || '00') +
                ':' +
                (leadingZero(v.getSeconds()) || '00')),
        ])
        append(row, node)
      })
      append(docFrag, row)
    })
    append(body, docFrag)
  }
  dispatcher = new Dispatcher({
    event: 'sort',
    callback: (e, target) => {
      let cur = target.getAttribute('data-sorting')
      let order = cur === 'asc' || !cur ? 'desc' : 'asc'
      let type = target.getAttribute('data-type')
      let column = target.getAttribute('data-column')
      let records = sortRecords(order, type, data, column)

      sorting.order = sorting
      sorting.type = type

      for (const child of target.parentNode.parentNode.children) {
        child.firstElementChild.setAttribute('aria-pressed', false)
        child.firstElementChild.removeAttribute('data-sorting')
      }

      target.setAttribute('aria-pressed', true)
      target.setAttribute('data-sorting', order)

      insertRecords(records)
    },
  })

  createTable()

  CustomScrollbars.refresh()

  return {
    target,
    table: null,
  }
}