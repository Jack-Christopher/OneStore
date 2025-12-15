import { useState } from 'react';
import { Box, Modal, Button, Alert, CircularProgress } from '@mui/material';
import { Upload } from 'lucide-react';
import { usePurchaseOrdersStore } from '@/store/purchaseOrdersStore';
import Select, { type SelectOption } from '@/components/Select';

interface PurchaseOrdersImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const importSourceOptions: SelectOption[] = [
  { value: 'keyfacil', label: 'Keyfacil' },
];

export default function PurchaseOrdersImportModal({ open, onClose, onSuccess }: PurchaseOrdersImportModalProps) {
  const { importFromKeyfacil, loading } = usePurchaseOrdersStore();
  const [selectedSource, setSelectedSource] = useState<string>('keyfacil');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - CSV or Excel
      const isValidFile = file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls');

      if (!isValidFile) {
        setError('El archivo debe ser CSV o Excel (.csv, .xlsx, .xls)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await importFromKeyfacil(selectedFile);

      setSuccess(result);

      if (result.failed === 0 && onSuccess) {
        // Auto-close after 2 seconds if all succeeded
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al importar el archivo');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setSelectedSource('keyfacil');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Importar Compras</h2>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Origen</label>
          <Select
            options={importSourceOptions}
            setFormInput={setSelectedSource}
            value={selectedSource}
          />
        </div>

        {selectedSource === 'keyfacil' && (
          <>
            <Alert severity="info" className="mb-4">
              <strong>Nota importante:</strong> Al importar Compras desde Keyfacil, es posible que además se importen automáticamente <strong>Productos</strong> y <strong>Proveedores</strong> si no existen en el sistema.
            </Alert>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Archivo Excel (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full border border-border rounded p-2 bg-card text-card-foreground"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
            </div>
          </>
        )}

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity={success.failed > 0 ? 'warning' : 'success'}
            className="mb-4"
          >
            <div>
              <p>
                <strong>Importación completada:</strong>
              </p>
              <p>{success.success} registros importados exitosamente</p>
              {success.failed > 0 && <p>{success.failed} registros fallaron</p>}
              {success.errors.length > 0 && success.errors.length <= 5 && (
                <ul className="mt-2 list-disc list-inside">
                  {success.errors.map((err, idx) => (
                    <li key={idx} className="text-sm">{err}</li>
                  ))}
                </ul>
              )}
              {success.errors.length > 5 && (
                <p className="text-sm mt-2">
                  {success.errors.length} errores. Revisa la consola para más detalles.
                </p>
              )}
            </div>
          </Alert>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
            onClick={handleImport}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

