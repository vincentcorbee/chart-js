import Chart from './chart'
import DataTable from './data-table'

const createChart = (data, options) => new Chart(data, options)

export {
  createChart,
  DataTable,
}
