import { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { useAuditLogsStore } from '@/store/auditLogsStore';
import type { AuditLog } from '@/services/api/auditLogs';
import dayjs from 'dayjs';
import { formatDate } from '@/utils/date';
import JsonViewer from '@/components/JsonViewer';
import { auditActionLabel, auditEntityLabel } from '@/constants/auditLabels';

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

function DiffViewer({ oldData, newData }: { oldData: unknown; newData: unknown }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-semibold text-accent">Antes</p>
        <JsonViewer data={oldData} />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-secondary">Después</p>
        <JsonViewer data={newData} />
      </div>
    </div>
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
  
  // Determinar el título según la acción
  const getDataTitle = () => {
    if (log.action === 'create') {
      return 'Datos agregados';
    } else if (log.action === 'delete') {
      return 'Datos eliminados';
    } else if (log.action === 'update') {
      return 'Cambios efectuados';
    } else if (log.action === 'login') {
      return 'Inicio de sesión';
    } else if (log.action === 'logout') {
      return 'Cierre de sesión';
    }
    return 'Datos Nuevos';
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box
        sx={{
          padding: '2rem',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
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
                <td className="py-2 px-4 font-medium border border-border bg-background">ID</td>
                <td className="py-2 px-4 border border-border">{log._id}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium border border-border bg-background">Fecha</td>
                <td className="py-2 px-4 border border-border">{formatDate(log.performed_at) || dayjs(log.performed_at).format('YYYY-MM-DD HH:mm:ss')}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium border border-border bg-background">Usuario</td>
                <td className="py-2 px-4 border border-border">{log.user_name || 'Usuario no disponible'}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium border border-border bg-background">Entidad</td>
                <td className="py-2 px-4 border border-border">{auditEntityLabel(log.entity)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium border border-border bg-background">Acción</td>
                <td className="py-2 px-4 border border-border">
                  <span style={{ 
                    color: log.action === 'create' ? '#4caf50' : log.action === 'update' ? '#ff9800' : log.action === 'delete' ? '#f44336' : '#2196f3',
                    fontWeight: 'bold'
                  }}>
                    {auditActionLabel(log.action)}
                  </span>
                </td>
              </tr>
              {log.entity_id && (
                <tr>
                  <td className="py-2 px-4 font-medium border border-border bg-background">ID de Entidad</td>
                  <td className="py-2 px-4 border border-border">{log.entity_id}</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Tabs for Data */}
        {showDiff && (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Cambios efectuados
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Comparación" />
                <Tab label="Antes" />
                <Tab label="Después" />
              </Tabs>
            </Box>
          </>
        )}

        {showDiff ? (
          <>
            <TabPanel value={tabValue} index={0}>
              <DiffViewer oldData={log.old_data} newData={log.new_data} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <JsonViewer data={log.old_data} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <JsonViewer data={log.new_data} />
            </TabPanel>
          </>
        ) : (
          <Box>
            {hasOldData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {log.action === 'delete' ? 'Datos eliminados' : 'Datos Anteriores'}
                </Typography>
                <JsonViewer data={log.old_data} />
              </Box>
            )}
            {hasNewData && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {getDataTitle()}
                </Typography>
                <JsonViewer data={log.new_data} />
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

