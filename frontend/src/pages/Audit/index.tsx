import { useEffect, useState } from 'react';
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, TextField, Box, Select, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';
import { useAuditLogsStore } from '@/store/auditLogsStore';
import { useAuthStore } from '@/store/authStore';
import AuditLogDetailsModal from './detailsModal';
import { Eye } from 'lucide-react';
import dayjs from 'dayjs';
import { formatDate } from '@/utils/date';
import DateInput from '@/components/DateInput';

const ENTITIES = ['Product', 'Sale', 'StockMovement', 'PurchaseOrder', 'Supplier', 'Category', 'Warehouse', 'Tenant', 'User'];
const ACTIONS = ['create', 'update', 'delete', 'login', 'logout'];

export default function AuditPage() {
  const user = useAuthStore((s) => s.authUser?.user);
  const role = user?.role || 'clerk';
  const { logs, total, limit, totalPages, loading, fetch } = useAuditLogsStore();

  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    tenant_id: '',
    user_id: '',
    entity: '',
    action: '',
    date_from: '',
    date_to: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFilters: any = {
      page: currentPage,
      limit: limit,
    };

    // Apply filters based on role
    if (role === 'admin') {
      if (filters.tenant_id) fetchFilters.tenant_id = filters.tenant_id;
      if (filters.user_id) fetchFilters.user_id = filters.user_id;
    } else if (role === 'manager') {
      // tenant_id is automatically applied by backend
      if (filters.user_id) fetchFilters.user_id = filters.user_id;
    }
    // clerk: no filters, backend applies tenant_id and user_id automatically

    if (filters.entity) fetchFilters.entity = filters.entity;
    if (filters.action) fetchFilters.action = filters.action;
    if (filters.date_from) fetchFilters.date_from = filters.date_from;
    if (filters.date_to) fetchFilters.date_to = filters.date_to;

    fetch(fetchFilters);
  }, [filters, currentPage, limit, fetch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = (logId: string) => {
    setSelectedLogId(logId);
    setOpenDetailsModal(true);
  };

  const columns = [
    {
      field: 'performed_at',
      headerName: 'Fecha',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        return formatDate(params.value) || dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      field: 'user_id',
      headerName: 'Usuario',
      width: 150,
    },
    {
      field: 'entity',
      headerName: 'Entidad',
      width: 150,
    },
    {
      field: 'action',
      headerName: 'Acción',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const action = params.value as string;
        const colorMap: Record<string, string> = {
          create: '#4caf50',
          update: '#ff9800',
          delete: '#f44336',
          login: '#2196f3',
          logout: '#9e9e9e',
        };
        return (
          <span style={{ color: colorMap[action] || '#000', fontWeight: 'bold' }}>
            {action.toUpperCase()}
          </span>
        );
      }
    },
    {
      field: 'entity_id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'actions',
      headerName: 'Detalles',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => handleViewDetails(params.row._id as string)}
          >
            <Eye />
          </Button>
        );
      }
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Auditoría</h1>

      {/* Filters */}
      <Box 
        className="filter-section"
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          flexWrap: 'wrap',
        }}
      >
        {role === 'admin' && (
          <>
            <TextField
              label="Tenant ID"
              size="small"
              value={filters.tenant_id}
              onChange={(e) => handleFilterChange('tenant_id', e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="User ID"
              size="small"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              sx={{ minWidth: 150 }}
            />
          </>
        )}
        {role === 'manager' && (
          <TextField
            label="User ID"
            size="small"
            value={filters.user_id}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            sx={{ minWidth: 150 }}
          />
        )}
        {(role === 'admin' || role === 'manager') && (
          <>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entidad</InputLabel>
              <Select
                value={filters.entity}
                label="Entidad"
                onChange={(e) => handleFilterChange('entity', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {ENTITIES.map((entity) => (
                  <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Acción</InputLabel>
              <Select
                value={filters.action}
                label="Acción"
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {ACTIONS.map((action) => (
                  <MenuItem key={action} value={action}>{action.toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ minWidth: 150 }}>
              <DateInput
                value={filters.date_from || ""}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                placeholder="Desde"
                className=""
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <DateInput
                value={filters.date_to || ""}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                placeholder="Hasta"
                className=""
              />
            </Box>
          </>
        )}
      </Box>

      {/* Table */}
      <div className="mt-4 datagrid-theme" style={{ height: 600 }}>
        <DataGrid
          showToolbar={false}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={logs || []}
          columns={columns}
          loading={loading}
          localeText={{
            noRowsLabel: "No hay registros de auditoría.",
          }}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={total}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: limit },
            },
          }}
          onPaginationModelChange={(model) => {
            setCurrentPage(model.page + 1);
          }}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Details Modal */}
      <AuditLogDetailsModal
        open={openDetailsModal}
        onClose={() => {
          setOpenDetailsModal(false);
          setSelectedLogId(null);
        }}
        logId={selectedLogId}
      />
    </div>
  );
}

