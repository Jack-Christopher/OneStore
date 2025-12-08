import { useState } from 'react';
import { Button, Box, Select, MenuItem, FormControl, InputLabel, Alert, Snackbar } from '@mui/material';
import { Download, Upload } from 'lucide-react';
import { exportModule, type ExportableModule, type ExportFormat } from '@/services/api/exports';
import { importModule, type ImportFormat } from '@/services/api/imports';

interface ExportImportButtonsProps {
  module: ExportableModule;
  moduleLabel: string;
  onImportSuccess?: () => void;
}

export default function ExportImportButtons({ module, moduleLabel, onImportSuccess }: ExportImportButtonsProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [importFormat, setImportFormat] = useState<ImportFormat>('csv');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportModule(module, exportFormat);
      setSnackbar({
        open: true,
        message: `Datos exportados exitosamente en formato ${exportFormat.toUpperCase()}`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Error al exportar: ${error.message || 'Error desconocido'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const expectedExtension = importFormat === 'csv' ? 'csv' : 'json';
    
    if (fileExtension !== expectedExtension) {
      setSnackbar({
        open: true,
        message: `El archivo debe ser de tipo .${expectedExtension}`,
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await importModule(module, importFormat, file);
      
      if (result.success && result.data) {
        const { success, failed, errors } = result.data;
        let message = `Importación completada: ${success} registros importados exitosamente`;
        if (failed > 0) {
          message += `, ${failed} registros fallaron`;
        }
        
        setSnackbar({
          open: true,
          message,
          severity: failed > 0 ? 'error' : 'success',
        });

        if (onImportSuccess) {
          onImportSuccess();
        }

        // Show errors if any
        if (errors.length > 0 && errors.length <= 10) {
          console.error('Errores de importación:', errors);
        }
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Error al importar: ${error.message || 'Error desconocido'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          padding: 2,
          marginBottom: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Export Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Formato</InputLabel>
            <Select
              value={exportFormat}
              label="Formato"
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={loading}
          >
            Exportar {moduleLabel}
          </Button>
        </Box>

        {/* Import Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Formato</InputLabel>
            <Select
              value={importFormat}
              label="Formato"
              onChange={(e) => setImportFormat(e.target.value as ImportFormat)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="secondary"
            component="label"
            startIcon={<Upload />}
            disabled={loading}
          >
            Importar {moduleLabel}
            <input
              type="file"
              hidden
              accept={importFormat === 'csv' ? '.csv' : '.json'}
              onChange={handleImport}
            />
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

