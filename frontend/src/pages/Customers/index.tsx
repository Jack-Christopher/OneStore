import { DataGrid } from '@mui/x-data-grid'
import mockCustomers from '@/services/mocks/customers'

export default function CustomersPage() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
  ]

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Customers</h1>
      <div style={{ height: 400 }}>
        <DataGrid rows={mockCustomers} columns={columns} />
      </div>
    </div>
  )
}
