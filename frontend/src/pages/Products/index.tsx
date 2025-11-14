import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import mockProducts from '@/services/mocks/products'
import { Button } from '@mui/material'
import type { Product } from '@/types'


export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([])

  useEffect(() => {
    setRows(mockProducts)
  }, [])

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    { field: 'price', headerName: 'Price', width: 100 },
  ]

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Products</h1>
      <Button variant="contained" color="primary">Add Product</Button>
      <div className="mt-4" style={{ height: 400 }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
    </div>
  )
}
