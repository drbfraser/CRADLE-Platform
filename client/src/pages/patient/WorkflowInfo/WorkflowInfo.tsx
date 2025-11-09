import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import { axiosFetch } from 'src/shared/api/core/http';
import Link from '@mui/material/Link';
import SearchIcon from '@mui/icons-material/Search';
import { getPrettyDate } from 'src/shared/utils';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

type RuleEvaluationResult = {
  patient: {
    id: string;
    name: string;
    age: number;
    sex: string;
    isPregnant: boolean;
    dateOfBirth: string;
  };
  branchResults: Array<{
    id: string;
    name: string;
    rule: string;
    resolvedData: Record<string, any>;
    status: string;
    missingVariables: string[];
  }>;
  selectedBranch: {
    id: string;
    name: string;
    rule: string;
    resolvedData: Record<string, any>;
    status: string;
  } | null;
};

/* -------- mock rows (instances) -------- */

// const DAYS = (n: number) => 24 * 60 * 60 * 1000 * n;
// const now = Date.now();

// function mk(
//   i: number,
//   o: {
//     inst: string;
//     tmpl: string;
//     coll: string;
//     status: WorkflowInfoRow['status'];
//     daysAgo: number;
//     steps: number;
//     current: string;
//   }
// ): WorkflowInfoRow {
//   return {
//     id: `wi_${String(i).padStart(4, '0')}`,
//     instanceTitle: o.inst,
//     templateId: `tmpl_${String((i % 15) + 1).padStart(4, '0')}`,
//     templateName: o.tmpl,
//     collection: o.coll,
//     status: o.status,
//     lastEdited: now - DAYS(o.daysAgo),
//     stepsCount: o.steps,
//     currentStepLabel: o.current,
//   };
// }

// const rowsRaw: WorkflowInfoRow[] = [
//   mk(1, {
//     inst: 'Papagaio – AA',
//     tmpl: 'Papagaio Research Study',
//     coll: 'PAPAGAO',
//     status: 'ACTIVE',
//     daysAgo: 1,
//     steps: 5,
//     current: 'Observation',
//   }),
//   mk(2, {
//     inst: 'Papagaio – BB',
//     tmpl: 'Papagaio Research Study',
//     coll: 'PAPAGAO',
//     status: 'COMPLETED',
//     daysAgo: 7,
//     steps: 5,
//     current: '–',
//   }),
//   mk(3, {
//     inst: 'Prenatal – ZZ',
//     tmpl: 'Prenatal Checkup',
//     coll: 'PRENATAL',
//     status: 'ACTIVE',
//     daysAgo: 2,
//     steps: 3,
//     current: 'Checkup',
//   }),
//   mk(4, {
//     inst: 'Oncology – CC',
//     tmpl: 'Oncology Follow-up',
//     coll: 'ONCO',
//     status: 'CANCELLED',
//     daysAgo: 30,
//     steps: 4,
//     current: '–',
//   }),
//   mk(5, {
//     inst: 'Cardio – DD',
//     tmpl: 'Cardio Rehab Plan',
//     coll: 'CARDIO',
//     status: 'ACTIVE',
//     daysAgo: 4,
//     steps: 6,
//     current: 'Session 2',
//   }),
//   mk(6, {
//     inst: 'Neuro – EE',
//     tmpl: 'Neuro Cognitive Study',
//     coll: 'NEURO',
//     status: 'COMPLETED',
//     daysAgo: 12,
//     steps: 5,
//     current: '–',
//   }),
//   mk(7, {
//     inst: 'Diabetes – FF',
//     tmpl: 'Diabetes Monitoring',
//     coll: 'ENDO',
//     status: 'ACTIVE',
//     daysAgo: 3,
//     steps: 4,
//     current: 'HbA1c Check',
//   }),
//   mk(8, {
//     inst: 'Geriatric – GG',
//     tmpl: 'Geriatric Assessment',
//     coll: 'GERI',
//     status: 'ACTIVE',
//     daysAgo: 6,
//     steps: 3,
//     current: 'Cognitive Test',
//   }),
//   mk(9, {
//     inst: 'Pediatric – HH',
//     tmpl: 'Pediatric Vaccination',
//     coll: 'PED',
//     status: 'ACTIVE',
//     daysAgo: 5,
//     steps: 3,
//     current: 'Dose 2',
//   }),
//   mk(10, {
//     inst: 'Mental – II',
//     tmpl: 'Mental Health Intake',
//     coll: 'PSY',
//     status: 'COMPLETED',
//     daysAgo: 10,
//     steps: 2,
//     current: '–',
//   }),
//   mk(11, {
//     inst: 'Ortho – JJ',
//     tmpl: 'Orthopedic Recovery',
//     coll: 'ORTHO',
//     status: 'CANCELLED',
//     daysAgo: 40,
//     steps: 3,
//     current: '–',
//   }),
//   mk(12, {
//     inst: 'Derm – KK',
//     tmpl: 'Dermatology Trial',
//     coll: 'DERM',
//     status: 'ACTIVE',
//     daysAgo: 8,
//     steps: 4,
//     current: 'Medication',
//   }),
//   mk(13, {
//     inst: 'Renal – LL',
//     tmpl: 'Renal Function Study',
//     coll: 'NEPH',
//     status: 'ACTIVE',
//     daysAgo: 11,
//     steps: 4,
//     current: 'GFR Test',
//   }),
//   mk(14, {
//     inst: 'Hepatic – MM',
//     tmpl: 'Hepatic Monitoring',
//     coll: 'HEP',
//     status: 'ACTIVE',
//     daysAgo: 9,
//     steps: 4,
//     current: 'Panel',
//   }),
//   mk(15, {
//     inst: 'Maternal – NN',
//     tmpl: 'Maternal Health Cohort',
//     coll: 'OBGYN',
//     status: 'ACTIVE',
//     daysAgo: 14,
//     steps: 5,
//     current: 'Week 20 Scan',
//   }),
// ];

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'TRUE':
      return <CheckCircleIcon color="success" fontSize="small" />;
    case 'FALSE':
      return <CancelIcon color="error" fontSize="small" />;
    case 'NOT_ENOUGH_DATA':
      return <HelpIcon color="warning" fontSize="small" />;
    default:
      return null;
  }
};

/* -------- component -------- */
export const WorkflowInfo: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  // const [detailOpen, setDetailOpen] = useState(false);
  // const [detailRow] = useState<WorkflowInfoRow | null>(null);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState<RuleEvaluationResult | null>(
    null
  );
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfoRow[]>([]);
  const navigate = useNavigate();

  const handleTestRuleEngine = async () => {
    setDemoDialogOpen(true);
    setDemoLoading(true);
    setDemoError(null);
    setDemoResult(null);

    try {
      const response = await axiosFetch.get(
        `/workflow-demo/evaluate/${patientId}`
      );
      setDemoResult(response.data);
    } catch (error: any) {
      setDemoError(error?.message || 'Unknown error occurred');
    } finally {
      setDemoLoading(false);
    }
  };

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
            onClick={handleTestRuleEngine}>
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

      {/* Details dialog */}
      {/* <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Workflow Instance Details</DialogTitle>
        <DialogContent dividers>
          {detailRow && (
            <Stack spacing={1.5}>
              <Typography>
                <b>Instance:</b> {detailRow.instanceTitle}
              </Typography>
              <Typography>
                <b>Template:</b> {detailRow.templateName}
              </Typography>
              <Typography>
                <b>Collection:</b> {detailRow.collection}
              </Typography>
              <Typography>
                <b>Status:</b>{' '}
                <Chip
                  size="small"
                  label={detailRow.status}
                  color={
                    detailRow.status === 'ACTIVE'
                      ? 'success'
                      : detailRow.status === 'COMPLETED'
                      ? 'primary'
                      : 'default'
                  }
                  variant="outlined"
                  sx={{ ml: 0.5 }}
                />
              </Typography>
              <Typography>
                <b>Last Edited:</b> {getPrettyDate(detailRow.lastEdited / 1000)}
              </Typography>
              <Divider />
              <Typography variant="subtitle1">
                <b>Steps</b> ({detailRow.stepsCount})
              </Typography>
              <List dense>
                {Array.from({ length: detailRow.stepsCount }, (_, i) => {
                  const name = `Step ${i + 1}`;
                  const isCurrent =
                    detailRow.currentStepLabel !== '–' &&
                    i === Math.max(0, detailRow.stepsCount - 2);
                  const status =
                    detailRow.status === 'COMPLETED'
                      ? 'Done'
                      : detailRow.status === 'CANCELLED'
                      ? 'Cancelled'
                      : isCurrent
                      ? 'Current'
                      : i < detailRow.stepsCount - 2
                      ? 'Done'
                      : 'Pending';
                  return (
                    <ListItem key={i} disableGutters divider>
                      <ListItemText
                        primary={name}
                        secondary={status}
                        slotProps={{
                          primary: {
                            sx: { fontWeight: isCurrent ? 600 : 400 },
                          },
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Typography>
                <b>Current Step:</b> {detailRow.currentStepLabel}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog> */}

      {/* Rule Engine Demo Dialog */}
      <Dialog
        open={demoDialogOpen}
        onClose={() => setDemoDialogOpen(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ScienceIcon />
            Rule Engine Evaluation Demo
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {demoLoading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={4}>
              <CircularProgress />
            </Box>
          )}

          {demoError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {demoError}
            </Alert>
          )}

          {demoResult && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Patient Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography>
                      <strong>Name:</strong> {demoResult.patient.name}
                    </Typography>
                    <Typography>
                      <strong>Age:</strong> {demoResult.patient.age} years
                    </Typography>
                    <Typography>
                      <strong>Sex:</strong> {demoResult.patient.sex}
                    </Typography>
                    <Typography>
                      <strong>Pregnant:</strong>{' '}
                      {demoResult.patient.isPregnant ? 'Yes' : 'No'}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>

              {demoResult.selectedBranch ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Selected Branch: {demoResult.selectedBranch.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    This patient would follow the{' '}
                    <strong>{demoResult.selectedBranch.name}</strong> workflow.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning">
                  <Typography variant="subtitle1" fontWeight="bold">
                    No Branch Selected
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {"No workflow branch matched the patient's data."}
                  </Typography>
                </Alert>
              )}

              <Box>
                <Typography variant="h6" gutterBottom>
                  All Branch Evaluations
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Branch Name</TableCell>
                        <TableCell>Rule</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Resolved Data</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {demoResult.branchResults.map((branch) => (
                        <TableRow
                          key={branch.id}
                          sx={{
                            backgroundColor:
                              branch.status === 'TRUE'
                                ? 'success.light'
                                : branch.status === 'FALSE'
                                ? 'error.light'
                                : 'warning.light',
                            opacity: branch.status === 'TRUE' ? 1 : 0.6,
                          }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {branch.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                wordBreak: 'break-all',
                              }}>
                              {branch.rule}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {getStatusIcon(branch.status)}
                              <Typography variant="body2" fontWeight="bold">
                                {branch.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                              }}>
                              {JSON.stringify(branch.resolvedData, null, 2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {
                    "How it works: The rule engine evaluates each workflow branch's conditions against the patient's data. The first branch that evaluates to TRUE is selected."
                  }
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
