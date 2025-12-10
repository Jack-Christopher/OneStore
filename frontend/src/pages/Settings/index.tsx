import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useSettingsStore } from '@/store/settingsStore'
import Alert from '@/components/Alert'
import { getBaseCurrency, setBaseCurrency } from '@/services/api/settings'

// TODO: fix bug when changing theme, the theme is applied immediately 
// even if the form is not submitted and the theme is not saved

const CURRENCIES = [
  { value: 'PEN', label: 'PEN - Sol Peruano' },
  { value: 'USD', label: 'USD - Dólar Estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Yen Japonés' },
  { value: 'GBP', label: 'GBP - Libra Esterlina' },
  { value: 'BRL', label: 'BRL - Real Brasileño' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
]

export default function SettingsPage() {
  const { settings, fetch, update, uploadLogoFile, loading, error } = useSettingsStore()
  const [form, setForm] = useState({
    store_name: '',
    store_ruc: '',
    date_format: '',
    currency: 'PEN',
  })
  const [baseCurrency, setBaseCurrencyState] = useState<string | null>(null)
  const [baseCurrencyLoading, setBaseCurrencyLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetch()
    fetchBaseCurrency()
  }, [])

  const fetchBaseCurrency = async () => {
    try {
      const res = await getBaseCurrency()
      if (res.success) {
        setBaseCurrencyState(res.data?.baseCurrency || null)
      }
    } catch (error) {
      console.error('Error fetching base currency:', error)
    }
  }

  const handleSetBaseCurrency = async (currency: string) => {
    if (baseCurrency) {
      setFormError('La moneda base ya está configurada y no puede ser cambiada')
      return
    }

    setBaseCurrencyLoading(true)
    setFormError('')
    try {
      await setBaseCurrency(currency)
      setBaseCurrencyState(currency)
      setSuccessMessage('Moneda base configurada exitosamente. Esta configuración no puede ser cambiada.')
      await fetchBaseCurrency()
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Error al configurar la moneda base')
    } finally {
      setBaseCurrencyLoading(false)
    }
  }

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || '',
        store_ruc: settings.store_ruc || '',
        date_format: settings.date_format || 'DD/MM/YYYY',
        currency: settings.currency || 'PEN',
      })

      if (settings.store_logo_path) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        setLogoPreview(`${apiUrl}${settings.store_logo_path}`)
      }
    }
  }, [settings])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Por favor seleccione un archivo de imagen')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('El archivo no debe exceder 5MB')
        return
      }
      setLogoFile(file)
      setFormError('')
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    try {
      // First upload logo if a new file was selected
      let logoPath = settings.store_logo_path
      if (logoFile) {
        const uploadedPath = await uploadLogoFile(logoFile)
        if (uploadedPath) {
          logoPath = uploadedPath
        } else {
          setFormError('Error al subir el logo')
          return
        }
      }

      // Then update all settings (excluding base_currency which is handled separately)
      await update({
        store_name: form.store_name,
        store_ruc: form.store_ruc,
        store_logo_path: logoPath,
        date_format: form.date_format,
        currency: form.currency,
      })

      setSuccessMessage('Configuración guardada exitosamente')
      setLogoFile(null)

      // Reload settings to apply globally
      await fetch()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setFormError(error.message || 'Error al guardar la configuración')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4 text-text-main">Configuración del Sistema</h1>

      {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}
      {formError && <Alert type="error" boldMessage="Error: " message={formError} styles="mb-4" />}
      {successMessage && <Alert type="success" boldMessage="Éxito: " message={successMessage} styles="mb-4" />}

      <form className="space-y-4 max-w-2xl" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 text-sm font-medium text-text-main">Nombre de la tienda</label>
          <input
            type="text"
            placeholder="Nombre de la tienda"
            className="border rounded p-2 w-full bg-background text-text-main border-secondary"
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-main">RUC / Número fiscal</label>
          <input
            type="text"
            placeholder="RUC / Número fiscal"
            className="border rounded p-2 w-full bg-background text-text-main border-secondary"
            value={form.store_ruc}
            onChange={(e) => setForm({ ...form, store_ruc: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-main">Logo</label>
          {logoPreview && (
            <div className="mb-2">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="max-w-xs max-h-32 object-contain border rounded p-2"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="border rounded p-2 w-full bg-background text-text-main border-secondary"
            onChange={handleFileChange}
          />
          <p className="text-xs text-text-secondary mt-1">Formatos permitidos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB</p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-main">Formato de fecha preferida</label>
          <select
            className="border rounded p-2 w-full bg-background text-text-main border-secondary"
            value={form.date_format}
            onChange={(e) => setForm({ ...form, date_format: e.target.value })}
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block mb-2 text-sm font-medium text-text-main">Moneda Base *</label>
          {baseCurrency ? (
            <>
              <input
                type="text"
                className="border rounded p-2 w-full bg-background text-text-main border-secondary"
                value={baseCurrency}
                readOnly
                disabled
              />
              <p className="text-xs text-text-secondary mt-1">
                ⚠️ La moneda base ya está configurada y no puede ser cambiada. Esta configuración es permanente.
              </p>
            </>
          ) : (
            <>
              <select
                className="border rounded p-2 w-full bg-background text-text-main border-secondary"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {CURRENCIES.filter(c => ['PEN', 'USD', 'EUR'].includes(c.value)).map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-secondary mt-1">
                ⚠️ Selecciona tu moneda base. Esta configuración no puede ser cambiada después de guardar.
              </p>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleSetBaseCurrency(form.currency)}
                disabled={baseCurrencyLoading}
                className="mt-2"
              >
                {baseCurrencyLoading ? 'Guardando...' : 'Configurar Moneda Base'}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </div>
  )
}
