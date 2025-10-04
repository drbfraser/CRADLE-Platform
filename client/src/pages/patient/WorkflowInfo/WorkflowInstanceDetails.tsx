// src/pages/patient/WorkflowInstanceDetails.tsx
import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { Tooltip, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getInstanceWithSteps,
  getPatientInfoAsync,
  getTemplate,
} from 'src/shared/api';
import { Nullable } from 'src/shared/constants';
import { formatISODateNumber } from 'src/shared/utils';
import { WorkflowInstanceStep } from 'src/shared/types/workflow/workflowApiTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceStep,
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import WorkflowStatus from './WorkflowInstanceDetailsComponents/WorkflowStatus';
import WorkflowStepHistory from './WorkflowInstanceDetailsComponents/WorkflowStepHistory';
import WorkflowPossibleSteps from './WorkflowInstanceDetailsComponents/WorkflowPossibleSteps';

function parseYMD(d?: Nullable<string>) {
  if (!d) return undefined;
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, day ?? 1);
  return isNaN(dt.getTime()) ? undefined : dt;
}

function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Computes:
 *  - completed / total
 *  - percent (0-100)
 *  - estDaysRemaining, etaDate (when not completed)
 *
 * Estimation logic:
 *   If we can infer at least one completed step duration (startedOn → completedOn),
 *   we use the average of those durations. Otherwise we fall back to 7 days per step.
 */
function computeProgressAndEta(steps: InstanceStep[], now = new Date()) {
  const total = steps.length || 1;
  const completed = steps.filter(
    (s) => s.status === StepStatus.COMPLETED
  ).length;
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.status === StepStatus.ACTIVE)
  );
  const percent = Math.round((completed / total) * 100);

  // Estimate days per step
  const durations: number[] = [];
  for (const s of steps) {
    const start = parseYMD(s.startedOn);
    const end = parseYMD(s.completedOn);
    if (start && end) durations.push(daysBetween(start, end));
  }
  const defaultDaysPerStep = 7;
  const avgDaysPerStep = durations.length
    ? Math.max(
        1,
        Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      )
    : defaultDaysPerStep;

  const remaining = total - completed;
  const estDaysRemaining = remaining > 0 ? remaining * avgDaysPerStep : 0;
  const etaDate =
    remaining > 0
      ? new Date(now.getTime() + estDaysRemaining * 86400000)
      : undefined;

  return { total, completed, percent, estDaysRemaining, etaDate, currentIndex };
}

export function mapWorkflowStep(apiStep: WorkflowInstanceStep): InstanceStep {
  return {
    id: apiStep.id,
    title: apiStep.name,
    status: apiStep.status,
    startedOn: formatISODateNumber(apiStep.startDate),
    completedOn: apiStep.completionDate
      ? formatISODateNumber(apiStep.completionDate)
      : null,
    description: apiStep.description,
    formId: apiStep.formId,
    hasForm: apiStep.formId ? true : false,
    expectedCompletion: apiStep.expectedCompletion
      ? formatISODateNumber(apiStep.expectedCompletion)
      : null,
    // nextStep?: string;  // TODO: Not implemented in backend yet
    // formSubmitted?: boolean; // TODO: Not implemented in backend yet
  };
}

export async function loadInstanceById(id: string): Promise<InstanceDetails> {
  const instance = await getInstanceWithSteps(id);
  const template = await getTemplate(instance.workflowTemplateId, {
    with_classification: true,
  });
  const patient = await getPatientInfoAsync(instance.patientId);

  const instanceDetails: InstanceDetails = {
    id: instance.id,
    studyTitle: instance.name,
    patientName: patient.name,
    patientId: instance.patientId,
    description: instance.description,
    collection: 'PAPAGO', // TODO - To do when collections set up
    version: template.version,
    firstCreatedOn: formatISODateNumber(template.dateCreated),
    lastEditedOn: formatISODateNumber(instance.lastEdited),
    lastEditedBy: instance.lastEditedBy,
    workflowStartedOn: formatISODateNumber(instance.startDate),
    workflowStartedBy: 'N/A', // TODO - add to backend? currently not in DB
    workflowCompletedOn: instance.completionDate
      ? formatISODateNumber(instance.completionDate)
      : null,

    // Steps
    steps: instance.steps.map((step) => mapWorkflowStep(step)),
    possibleSteps: [],
  };

  return instanceDetails;
}

function loadMockInstanceById(id: string): InstanceDetails {
  return {
    id,
    studyTitle: 'Papagaio Research Study',
    patientName: 'Sue Smith',
    patientId: '12345',

    description: 'hardcore: need to import workflow Template basicInfo part',
    collection: 'PAPAGAO',
    version: 'v4',
    firstCreatedOn: '2019-05-09',
    firstCreatedBy: 'Katie Jones',
    lastEditedOn: '2019-06-10',
    lastEditedBy: 'Bert Smith',
    workflowStartedOn: '2019-01-18',
    workflowStartedBy: 'Katie Jones',
    workflowCompletedOn: '2020-03-19',

    steps: [
      {
        id: 's1',
        title: 'Step 1: Intake Details',
        status: StepStatus.COMPLETED,
        completedOn: '2019-06-05',
        description: 'Collect patient intake information and consent forms.',
        hasForm: true,
        formSubmitted: true,
        nextStep: 'Step 2: Randomize Treatment',
      },
      {
        id: 's2',
        title: 'Step 2: Randomize Treatment',
        status: StepStatus.ACTIVE,
        startedOn: '2019-06-06',
        description: 'Randomize patient to treatment or control group.',
        hasForm: true,
        formSubmitted: false,
        expectedCompletion: '2019-06-12',
      },
      {
        id: 's3',
        title: 'Step 3: Observe Until 8w',
        status: StepStatus.PENDING,
        description: 'Monitor patient progress for 8 weeks.',
        hasForm: false,
        nextStep: '<Same as Template>',
      },
    ],
    possibleSteps: [
      {
        id: 'ps1',
        title: 'Step 4: Follow-up Assessment',
        hasForm: true,
        estimate: 6,
        isSkippable: true,
      },
      {
        id: 'ps2',
        title: 'Step 5: Final Review',
        hasForm: false,
        estimate: 3,
        isSkippable: false,
      },
    ],
  };
}

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [workflowInstance, setWorkflowInstance] =
    useState<InstanceDetails | null>(null);
  const [progressInfo, setProgressInfo] = useState<WorkflowInstanceProgress>({
    total: 0,
    completed: 0,
    percent: 0,
    estDaysRemaining: 0,
    currentIndex: 0,
  });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    async function fetchInstance() {
      try {
        const instance = await loadInstanceById('test-workflow-instance-1');
        setWorkflowInstance(instance);
        const progress = computeProgressAndEta(instance.steps);
        setProgressInfo(progress);
      } catch (err) {
        console.error('Failed to load workflow instance', err);
      }
    }
    fetchInstance();
  }, [instanceId]);

  const data = React.useMemo(
    () => loadMockInstanceById(instanceId ?? 'wi_0001'),
    [instanceId]
  );

  React.useMemo(() => computeProgressAndEta(data.steps), [data.steps]);

  const handleMakeCurrent = React.useCallback(
    (stepId: string, title: string) => {
      setConfirmDialog({
        open: true,
        title: 'Override Current Step',
        message: `Override current step and move to ${title}?`,
        onConfirm: () => {
          console.log('Make current step:', stepId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    []
  );

  return (
    <>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back" placement="top">
            <IconButton onClick={() => navigate(-1)} size="medium">
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 0.5 }}>
            <Typography variant="h4" component="h2">
              Workflow Instance Details
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {!workflowInstance ? (
          <Typography variant="h5" component="p">
            Loading workflow instance...
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                mx: 4,
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5">
                  {workflowInstance.studyTitle}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={
                    open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                  }
                  onClick={() => setOpen((v) => !v)}
                  sx={{ textTransform: 'none' }}>
                  {open ? 'Hide Details' : 'Show Details'}
                </Button>
              </Box>

              <Typography variant="h6" color="text.secondary">
                Patient: {workflowInstance.patientName} (ID:{' '}
                {workflowInstance.patientId})
              </Typography>
            </Box>

            {/* Collapsible Workflow Template Details */}
            <Collapse in={open} unmountOnExit>
              <Box sx={{ mx: 4, mb: 3 }}>
                <Box
                  sx={{
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    mb: 2,
                  }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Workflow Template Details
                  </Typography>
                  <WorkflowMetadata
                    description={workflowInstance.description}
                    collectionName={workflowInstance.collection}
                    version={parseInt(workflowInstance.version) || 1}
                    lastEdited={workflowInstance.lastEditedOn}
                    dateCreated={workflowInstance.firstCreatedOn}
                  />
                </Box>
              </Box>
            </Collapse>

            {/* Section 2: Workflow Status */}
            <WorkflowStatus
              workflowInstance={workflowInstance}
              progressInfo={progressInfo}
            />

            {/* Section 3: Step history */}
            <WorkflowStepHistory
              workflowInstance={workflowInstance}
              expandedStep={expandedStep}
              setExpandedStep={setExpandedStep}
              expandAll={expandAll}
              setExpandAll={setExpandAll}
              setConfirmDialog={setConfirmDialog}
              handleMakeCurrent={handleMakeCurrent}
            />

            {/* Section 4: Possible Other Steps */}
            <WorkflowPossibleSteps
              workflowInstance={workflowInstance}
              handleMakeCurrent={handleMakeCurrent}
            />

            {/* Confirmation Dialog */}
            <Dialog
              open={confirmDialog.open}
              onClose={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-description">
              <DialogTitle id="confirm-dialog-title">
                {confirmDialog.title}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                  {confirmDialog.message}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() =>
                    setConfirmDialog((prev) => ({ ...prev, open: false }))
                  }>
                  Cancel
                </Button>
                <Button
                  onClick={confirmDialog.onConfirm}
                  color="primary"
                  variant="contained">
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </>
  );
}
