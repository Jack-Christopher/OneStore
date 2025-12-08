import { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { useAuditLogsStore, type AuditLog } from '@/store/auditLogsStore';
import dayjs from 'dayjs';

interface AuditLogDetailsModalProps {
  open: boolean;
  onClose: () => void;
  logId: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function formatJSON(obj: any): string {
  if (!obj) return 'N/A';
  return JSON.stringify(obj, null, 2);
}

function DiffViewer({ oldData, newData }: { oldData: any; newData: any }) {
  const oldStr = formatJSON(oldData);
  const newStr = formatJSON(newData);

  // Simple diff: compare line by line
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '400px', overflow: 'auto' }}>
      <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#f44336', fontWeight: 'bold' }}>
          Datos Anteriores
        </Typography>
        <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {oldStr}
        </pre>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#4caf50', fontWeight: 'bold' }}>
          Datos Nuevos
        </Typography>
        <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {newStr}
        </pre>
      </Box>
    </Box>
  );
}

export default function AuditLogDetailsModal({ open, onClose, logId }: AuditLogDetailsModalProps) {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { getOne } = useAuditLogsStore();

  useEffect(() => {
    if (logId) {
      getOne(logId).then((data) => {
        if (data) {
          setLog(data);
        }
      });
    } else {
      setLog(null);
    }
  }, [logId, getOne]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!log) {
    return null;
  }

  const hasOldData = log.old_data !== null && log.old_data !== undefined;
  const hasNewData = log.new_data !== null && log.new_data !== undefined;
  const showDiff = hasOldData && hasNewData;

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: 24,
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Detalles de Auditoría
        </Typography>

        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          <table className="w-full text-sm leading-5 border-collapse">
            <tbody>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">ID</td>
                <td className="py-2 px-4 border">{log._id}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">Fecha</td>
                <td className="py-2 px-4 border">{dayjs(log.performed_at).format('YYYY-MM-DD HH:mm:ss')}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">Usuario</td>
                <td className="py-2 px-4 border">{log.user_id}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">Entidad</td>
                <td className="py-2 px-4 border">{log.entity}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">Acción</td>
                <td className="py-2 px-4 border">
                  <span style={{ 
                    color: log.action === 'create' ? '#4caf50' : log.action === 'update' ? '#ff9800' : log.action === 'delete' ? '#f44336' : '#2196f3',
                    fontWeight: 'bold'
                  }}>
                    {log.action.toUpperCase()}
                  </span>
                </td>
              </tr>
              {log.entity_id && (
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-600 bg-gray-50 border">ID de Entidad</td>
                  <td className="py-2 px-4 border">{log.entity_id}</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Tabs for Data */}
        {showDiff && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Comparación" />
              <Tab label="Datos Anteriores" />
              <Tab label="Datos Nuevos" />
            </Tabs>
          </Box>
        )}

        {showDiff ? (
          <>
            <TabPanel value={tabValue} index={0}>
              <DiffViewer oldData={log.old_data} newData={log.new_data} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <pre style={{ 
                margin: 0, 
                fontSize: '12px', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                padding: '1rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {formatJSON(log.old_data)}
              </pre>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <pre style={{ 
                margin: 0, 
                fontSize: '12px', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                padding: '1rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {formatJSON(log.new_data)}
              </pre>
            </TabPanel>
          </>
        ) : (
          <Box>
            {hasOldData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Datos Anteriores
                </Typography>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  fontFamily: 'monospace', 
                  whiteSpace: 'pre-wrap',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {formatJSON(log.old_data)}
                </pre>
              </Box>
            )}
            {hasNewData && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Datos Nuevos
                </Typography>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  fontFamily: 'monospace', 
                  whiteSpace: 'pre-wrap',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {formatJSON(log.new_data)}
                </pre>
              </Box>
            )}
            {!hasOldData && !hasNewData && (
              <Typography variant="body2" color="text.secondary">
                No hay datos adicionales para mostrar.
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" onClick={onClose}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

