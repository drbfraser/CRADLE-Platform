import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import { formatISODateNumber } from 'src/shared/utils';
import { Toast } from 'src/shared/components/toast';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getInstancesByPatient } from 'src/shared/api';
import { WorkflowInfoRow } from 'src/shared/types/workflow/workflowUiTypes';
import { buildWorkflowInstanceRowList } from './utils';
import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';
import RuleEngineDemoDialog from './components/RuleEngineDemoDialog';
import { WorkflowInfoToolbar } from './components/WorkflowInfoToolbar';

type ToastState = {
  severity: React.ComponentProps<typeof Toast>['severity'];
  message: string;
};

/* -------- component -------- */
export const WorkflowInfo: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const openDemoDialog = useRef<() => void>();

  useEffect(() => {
    async function fetchWorkflowInfo() {
      try {
        setLoading(true);
        const instances = await getInstancesByPatient(patientId!, true);
        const workflowInfoRows = await buildWorkflowInstanceRowList(instances);
        setWorkflowInfo(workflowInfoRows);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load workflow instances for patient.', err);
      }
    }
    fetchWorkflowInfo();
  }, [patientId]);

  const columns: GridColDef[] = [
    // { field: 'instanceTitle', headerName: 'Workflow Instance', width: 175 },
    { field: 'templateName', headerName: 'Workflow Name', width: 180 },
    {
      field: 'description',
      headerName: 'Description',
      width: 220,
      renderCell: (p: GridRenderCellParams) => {
        const val = (p.row as WorkflowInfoRow).description;
        if (!val) return <>N/A</>;
        return val.length > 40 ? <>{val.slice(0, 40)}…</> : <>{val}</>;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['Active', 'Completed', 'Cancelled'],
      width: 120,
      sortComparator: (v1, v2) => {
        const order: Record<InstanceStatus, number> = {
          [InstanceStatus.ACTIVE]: 0,
          [InstanceStatus.COMPLETED]: 1,
          [InstanceStatus.CANCELLED]: 2,
        };
        return order[v1 as InstanceStatus] - order[v2 as InstanceStatus];
      },
      renderCell: (p: GridRenderCellParams) => {
        const row = p.row as WorkflowInfoRow;
        return (
          <Chip
            size="small"
            label={row.status.toUpperCase()}
            color={
              row.status === InstanceStatus.ACTIVE
                ? 'success'
                : row.status === InstanceStatus.COMPLETED
                  ? 'primary'
                  : 'error'
            }
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'lastEdited',
      headerName: 'Last Edited',
      type: 'number',
      width: 130,
      sortingOrder: ['desc', 'asc'],
      valueGetter: (_value: unknown, row: WorkflowInfoRow) => row.lastEdited,
      renderCell: (params: GridRenderCellParams) => {
        const d = params.value as number | undefined;
        return <>{d ? formatISODateNumber(d) : '-'}</>;
      },
    },
    { field: 'stepsCount', headerName: 'Steps', type: 'number', width: 105 },
    { field: 'currentStepLabel', headerName: 'Current Step', width: 140 },
  ];

  const location = useLocation();

  const navState = location.state as { toast?: ToastState } | null;

  const [toast, setToast] = useState<ToastState | null>(
    navState?.toast ?? null
  );

  const handleToastClose = () => {
    setToast(null);
  };
  const handleRowClick = (params: GridRowParams) => {
    const row = params.row as WorkflowInfoRow;
    navigate(`/workflow-instance/view/${row.id}`);
  };

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Page header */}
      {toast && (
        <Toast
          severity={toast.severity}
          message={toast.message}
          open={true}
          onClose={handleToastClose}
        />
      )}
      <Box
        borderBottom={1.5}
        borderColor="divider"
        pb={1.5}
        mb={1.5}
        display="flex"
        justifyContent="space-between"
        alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <AccountTreeOutlinedIcon />
          <Typography variant="h5">Workflows</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', height: 36 }}
            startIcon={<AddIcon />}
            onClick={() => navigate(`/workflow-instance/new/${patientId}`)}>
            Start New Workflow
          </Button>
          {/* Rule Engine Button */}
          <Button
            variant="contained"
            size="small"
            color="secondary"
            sx={{ textTransform: 'none', height: 36 }}
            startIcon={<ScienceIcon />}
            onClick={() => openDemoDialog.current?.()}>
            Test Rule Engine
          </Button>
        </Box>
      </Box>

      {/* Grid with built-in filtering UI */}
      <Box sx={{ height: 620, width: '100%' }}>
        <DataGrid
          rows={workflowInfo}
          columns={columns}
          loading={loading}
          getRowId={(r) => (r as WorkflowInfoRow).id}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell.MuiDataGrid-cell--withFocus': {
              outline: 'none',
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-row:hover .MuiDataGrid-cell': {
              backgroundColor: 'inherit',
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: {
              sortModel: [
                { field: 'status', sort: 'asc' },
                { field: 'lastEdited', sort: 'desc' },
              ],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          slots={{ toolbar: WorkflowInfoToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 400 },
            },
          }}
        />
      </Box>

      <RuleEngineDemoDialog patientId={patientId} openDialog={openDemoDialog} />
    </Paper>
  );
};
