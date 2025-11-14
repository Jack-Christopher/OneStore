import { TextField, Button } from '@mui/material'

export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <form className="space-y-3 max-w-md">
        <TextField fullWidth label="Store Name" defaultValue="OneStore" />
        <TextField fullWidth label="Currency" defaultValue="USD" />
        <Button variant="contained" color="primary">Save</Button>
      </form>
    </div>
  )
}
