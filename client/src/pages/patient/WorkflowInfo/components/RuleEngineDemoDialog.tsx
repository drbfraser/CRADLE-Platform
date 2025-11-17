import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  Alert,
  TableBody,
  TableRow,
  TableCell,
  DialogContent,
  Stack,
  TableContainer,
  Table,
  TableHead,
  DialogActions,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import { axiosFetch } from 'src/shared/api';
import { useEffect, useState } from 'react';

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

interface IProps {
  patientId: string | undefined;
  openDialog: React.MutableRefObject<(() => void) | undefined>;
}

export default function RuleEngineDemoDialog({
  patientId,
  openDialog,
}: IProps) {
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState<RuleEvaluationResult | null>(
    null
  );

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
    openDialog.current = handleTestRuleEngine;
  }, [openDialog]);

  return (
    <>
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
    </>
  );
}
