import { useState } from 'react'
import mockProducts from '@/services/mocks/products'
import type { Product } from '@/types'

export default function SalesPage() {
  const [cart, setCart] = useState<Product[]>([])

  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Sales (Mock POS)</h1>
      <div className="grid grid-cols-3 gap-3">
        {mockProducts.map((p) => (
          <div key={p.id} className="p-3 bg-white shadow rounded-xl">
            <p>{p.name}</p>
            <p>${p.price}</p>
            <button
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => addToCart(p)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="font-bold">Cart</h2>
        {cart.map((item, i) => (
          <p key={i}>{item.name}</p>
        ))}
      </div>
    </div>
  )
}
