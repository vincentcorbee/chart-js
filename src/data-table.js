class DataTable {
  constructor() {
    this.table = {
      columns: [],
    }
  }

  addRows(rows) {
    rows.forEach(row => row.forEach((col, i) => this.table.columns[i].data.push(col)))
  }

  addColumn(type, label) {
    this.table.columns.push({
      type,
      label,
      data: [],
    })
  }
}

export default DataTable