import { Button } from '@mui/material'

export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <form className="space-y-3 max-w-md">
        <label className="block mb-2 text-sm font-medium">Nombre de la tienda</label>
        <input type="text" placeholder="Nombre de la tienda" className="border rounded p-2 w-full mb-3" />
        <label className="block mb-2 text-sm font-medium">Moneda</label>
        <input type="text" placeholder="Moneda" className="border rounded p-2 w-full mb-3" />
        <label className="block mb-2 text-sm font-medium">Tema</label>
        <select className="border rounded p-2 w-full mb-3">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <Button variant="contained" color="primary">Guardar</Button>
      </form>
    </div>
  )
}
