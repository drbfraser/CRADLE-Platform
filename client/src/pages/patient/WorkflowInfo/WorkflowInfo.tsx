import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import Link from '@mui/material/Link';
import SearchIcon from '@mui/icons-material/Search';
import { getPrettyDate } from 'src/shared/utils';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
  useGridApiContext,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getInstancesByPatient } from 'src/shared/api';
import { WorkflowInfoRow } from 'src/shared/types/workflow/workflowUiTypes';
import { buildWorkflowInstanceRowList } from './WorkflowUtils';
import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';
import RuleEngineDemoDialog from './components/RuleEngineDemoDialog';

function Toolbar() {
  const apiRef = useGridApiContext();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const leaveTimer = React.useRef<number | null>(null);

  const parse = (input: string) =>
    input
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const applySearch = (v: string) => {
    setSearch(v);
    apiRef.current.setQuickFilterValues(parse(v));
  };

  const handleEnter = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    leaveTimer.current = window.setTimeout(
      () => setOpen(false),
      180
    ) as unknown as number;
  };

  return (
    <GridToolbarContainer
      sx={{
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <GridToolbarFilterButton />
      </Box>

      <Box sx={{ height: 24, borderLeft: 1, borderColor: 'divider' }} />

      <Box
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => setOpen(true)}
        sx={{
          width: open ? 340 : 40,
          transition: open ? 'width 0.40s ease' : 'width 0.80s ease',
          display: 'flex',
          alignItems: 'center',
        }}>
        <TextField
          value={search}
          onChange={(e) => applySearch(e.target.value)}
          placeholder="Search..."
          size="small"
          fullWidth
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 36,
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: open ? undefined : '0 !important',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: open ? undefined : '0 !important',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: open ? 2 : 0,
              },
              px: open ? 0.5 : 0,
              transition: 'padding 0.25s ease',
            },
            '& .MuiInputBase-input': {
              opacity: open ? 1 : 0,
              width: open ? 'auto' : 0,
              transition: 'opacity 0.18s ease, width 0.38s ease',
              pointerEvents: open ? 'auto' : 'none',
            },
          }}
        />
      </Box>
    </GridToolbarContainer>
  );
}

/* -------- component -------- */
export const WorkflowInfo: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfoRow[]>([]);
  const navigate = useNavigate();
  const openDemoDialog = useRef<() => void>();

  useEffect(() => {
    async function fetchWorkflowInfo() {
      try {
        const instances = await getInstancesByPatient(patientId!, true);
        console.log('PATIENT INSTANCE PULL:', instances);

        const workflowInfoRows = await buildWorkflowInstanceRowList(instances);
        console.log('TEST1', workflowInfoRows);
        setWorkflowInfo(workflowInfoRows);
      } catch (err) {
        console.error('Failed to load workflow instances for patient.', err);
      }
    }
    fetchWorkflowInfo();
  }, [patientId]);

  const columns: GridColDef[] = [
    { field: 'instanceTitle', headerName: 'Workflow Instance', width: 175 },
    { field: 'templateName', headerName: 'Workflow Template', width: 180 },
    { field: 'collection', headerName: 'Collection', width: 125 },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      width: 120,
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
      type: 'date',
      width: 130,
      valueGetter: (_value: unknown, row: WorkflowInfoRow) =>
        new Date(row.lastEdited),
      renderCell: (params: GridRenderCellParams) => {
        const d = params.value as Date | undefined;
        return <>{d ? getPrettyDate(d.getTime() / 1000) : '-'}</>;
      },
    },
    { field: 'stepsCount', headerName: 'Steps', type: 'number', width: 105 },
    { field: 'currentStepLabel', headerName: 'Current Step', width: 140 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as WorkflowInfoRow;
        return (
          <Button
            size="small"
            onClick={() => {
              navigate(`/workflow-instance/view/${row.id}`, {
                state: {
                  viewWorkflowInstance: row,
                },
              });
            }}>
            View Details
          </Button>
        );
      },
    },
  ];

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Page header */}
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
          <Typography variant="h5">Ongoing Workflows</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', height: 36 }}
            startIcon={<AddIcon />}>
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
        <Link
          href="#"
          sx={{
            textTransform: 'none',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            fontSize: '1rem',
          }}>
          View past workflow
        </Link>
      </Box>

      {/* Grid with built-in filtering UI */}
      <Box sx={{ height: 620, width: '100%' }}>
        <DataGrid
          rows={workflowInfo}
          columns={columns}
          getRowId={(r) => (r as WorkflowInfoRow).id}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'lastEdited', sort: 'desc' }] },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          slots={{ toolbar: Toolbar }}
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
