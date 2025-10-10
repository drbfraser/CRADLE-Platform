// src/pages/patient/WorkflowInstanceDetails.tsx
import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Tooltip, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getInstanceWithSteps,
  getPatientInfoAsync,
  getTemplate,
} from 'src/shared/api';
import { ISODate, Nullable } from 'src/shared/constants';
import { formatISODateNumber } from 'src/shared/utils';
import { WorkflowInstanceStep } from 'src/shared/types/workflow/workflowTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';

type InstanceStep = {
  id: string;
  title: string;
  description?: string;
  startedOn?: ISODate;
  formId?: string;
  hasForm: boolean;
  expectedCompletion?: Nullable<ISODate>;
  completedOn?: Nullable<ISODate>;
  status: StepStatus;
  nextStep?: string;
  formSubmitted?: boolean;
};

type PossibleStep = {
  id: string;
  title: string;
  hasForm?: boolean;
  estimate?: number;
  isSkippable?: boolean;
};

export type InstanceDetails = {
  id: string;

  // Summary card
  studyTitle: string;
  patientName: string;
  patientId: string;

  // Details section (sketch fields)
  description: string;
  collection: string;
  version: string;
  firstCreatedOn: string;
  firstCreatedBy?: string;
  lastEditedOn: ISODate;
  lastEditedBy?: string;
  workflowStartedOn: ISODate;
  workflowStartedBy: Nullable<string>;
  workflowCompletedOn?: Nullable<ISODate>;

  // Steps
  steps: InstanceStep[];
  possibleSteps: PossibleStep[];
};

export type WorkflowInstanceProgress = {
  total: number;
  completed: number;
  percent: number;
  estDaysRemaining: number;
  etaDate?: Date;
  currentIndex: number;
};

const formatWhen = (s: InstanceStep) => {
  if (s.status === StepStatus.COMPLETED && s.completedOn) {
    return `Status: Completed, Completed on: ${s.completedOn}`;
  }
  if (s.status === StepStatus.ACTIVE) {
    return `Status: In Progress${
      s.startedOn ? `, Started on: ${s.startedOn}` : ''
    }`;
  }
  return 'Status: Pending';
};

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

  // Callback functions
  const handleViewForm = React.useCallback((stepId: string) => {
    console.log('View form for step:', stepId);
  }, []);

  const handleEditForm = React.useCallback((stepId: string) => {
    console.log('Edit form for step:', stepId);
  }, []);

  const handleDiscardForm = React.useCallback((stepId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Discard Form',
      message:
        'Are you sure you want to discard the submitted form? This action cannot be undone.',
      onConfirm: () => {
        console.log('Discard form for step:', stepId);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

  const handleSubmitForm = React.useCallback((stepId: string) => {
    console.log('Submit form for step:', stepId);
  }, []);

  const handleCompleteNow = React.useCallback((stepId: string) => {
    console.log('Complete now for step:', stepId);
  }, []);

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

  const handleChangeExpectedCompletion = React.useCallback(
    (stepId: string, date: string) => {
      console.log('Change expected completion for step:', stepId, 'to:', date);
    },
    []
  );

  const data = React.useMemo(
    () => loadMockInstanceById(instanceId ?? 'wi_0001'),
    [instanceId]
  );

  React.useMemo(() => computeProgressAndEta(data.steps), [data.steps]);

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
            <Box sx={{ mx: 5, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Workflow Status
              </Typography>

              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                }}>
                {/* Summary Row */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CalendarTodayOutlinedIcon
                        color="success"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Started
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {workflowInstance.workflowStartedOn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {workflowInstance.workflowStartedBy}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ReplayIcon
                        color="primary"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Step
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {progressInfo.currentIndex + 1} of{' '}
                        {workflowInstance.steps.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {workflowInstance.steps[progressInfo.currentIndex]
                          ?.title || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-flex',
                          mb: 1,
                        }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 600,
                          }}>
                          {progressInfo.percent}%
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {progressInfo.completed} / {progressInfo.total}{' '}
                        completed
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      {data.workflowCompletedOn ? (
                        <CheckCircleOutlineIcon
                          color="success"
                          sx={{ fontSize: 32, mb: 1 }}
                        />
                      ) : (
                        <HourglassEmptyIcon
                          color="disabled"
                          sx={{ fontSize: 32, mb: 1 }}
                        />
                      )}
                      <Typography variant="subtitle2" color="text.secondary">
                        {workflowInstance.workflowCompletedOn
                          ? 'Completed'
                          : 'Estimated Completion'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {workflowInstance.workflowCompletedOn ||
                          (progressInfo.etaDate
                            ? progressInfo.etaDate.toISOString().slice(0, 10)
                            : 'TBD')}
                      </Typography>
                      {!workflowInstance.workflowCompletedOn &&
                        progressInfo.etaDate && (
                          <Typography variant="caption" color="text.secondary">
                            ~{progressInfo.estDaysRemaining} days remaining
                          </Typography>
                        )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}>
                    Overall Progress
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressInfo.percent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { borderRadius: 4 },
                      }}
                    />
                    {/* Step markers on progress bar */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                      }}>
                      {data.steps.map((s, idx) => {
                        const leftPct =
                          data.steps.length > 1
                            ? (idx / (data.steps.length - 1)) * 100
                            : 0;
                        const isCurrent = idx === progressInfo.currentIndex;
                        const isDone = s.status === StepStatus.COMPLETED;
                        return (
                          <Tooltip
                            key={s.id}
                            title={`${s.title}${
                              isCurrent
                                ? ' (Current)'
                                : isDone
                                ? ' (Completed)'
                                : ' (Pending)'
                            }`}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -5,
                                left: `calc(${leftPct}% - 2px)`,
                                width: isCurrent ? 20 : 16,
                                height: isCurrent ? 20 : 16,
                                borderRadius: '50%',
                                bgcolor: isCurrent
                                  ? 'primary.main'
                                  : isDone
                                  ? 'success.main'
                                  : 'grey.400',
                                border: '2px solid #fff',
                                boxShadow: 1,
                                pointerEvents: 'auto',
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* "Currently Working On" Section Details */}
                {workflowInstance.steps[progressInfo.currentIndex] && (
                  <Box
                    sx={{
                      // backgroundColor: 'primary.50',
                      borderLeft: 4,
                      borderLeftColor: 'primary.main',
                      p: 2,
                      borderRadius: 4,
                    }}>
                    <Typography
                      variant="subtitle2"
                      color="primary.main"
                      sx={{ mb: 0.5 }}>
                      Currently Working On:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {workflowInstance.steps[progressInfo.currentIndex].title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatWhen(
                        workflowInstance.steps[progressInfo.currentIndex]
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Section 3: Step history */}
            <Box sx={{ mx: 5, mb: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">Step history</Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setExpandAll(!expandAll);
                      setExpandedStep(null);
                    }}>
                    {expandAll ? 'Collapse All' : 'Expand All'}
                  </Button>
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ borderRadius: '12px', p: 3 }}>
                {workflowInstance.steps.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}>
                    No steps recorded yet.
                  </Typography>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    {/* Vertical Rail */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 20,
                        top: 32,
                        bottom: 0,
                        width: 3,
                        bgcolor: 'grey.300',
                        zIndex: 0,
                      }}
                    />

                    {workflowInstance.steps.map((step) => {
                      const isExpanded = expandAll || expandedStep === step.id;
                      const statusIcon =
                        step.status === StepStatus.COMPLETED ? (
                          <CheckCircleOutlineIcon
                            color="success"
                            sx={{ fontSize: 24 }}
                          />
                        ) : step.status === StepStatus.ACTIVE ? (
                          <ReplayIcon color="primary" sx={{ fontSize: 24 }} />
                        ) : (
                          <HourglassEmptyIcon
                            sx={{ color: 'grey.400', fontSize: 24 }}
                          />
                        );

                      return (
                        <Box key={step.id} sx={{ position: 'relative', mb: 3 }}>
                          {/* Step Row */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              cursor: 'pointer',
                              p: 2,
                              borderRadius: '8px',
                              '&:hover': { bgcolor: 'grey.50' },
                              position: 'relative',
                              zIndex: 1,
                            }}
                            onClick={() =>
                              !expandAll &&
                              setExpandedStep(isExpanded ? null : step.id)
                            }>
                            {/* Status Icon */}
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.paper',
                                border: 2,
                                borderColor:
                                  step.status === StepStatus.COMPLETED
                                    ? 'success.main'
                                    : step.status === StepStatus.ACTIVE
                                    ? 'primary.main'
                                    : 'grey.300',
                                borderRadius: '50%',
                                mr: 3,
                              }}>
                              {statusIcon}
                            </Box>

                            {/* Step Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ mb: 0.5 }}>
                                {step.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}>
                                {formatWhen(step)}
                              </Typography>
                              {step.status === StepStatus.ACTIVE && (
                                <Chip
                                  size="small"
                                  color="primary"
                                  label="Current step"
                                  sx={{ mb: 1 }}
                                />
                              )}
                            </Box>

                            {/* Expand Button */}
                            {!expandAll && (
                              <IconButton size="small" sx={{ ml: 1 }}>
                                {isExpanded ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </IconButton>
                            )}
                          </Box>

                          {/* Expanded Content */}
                          <Collapse in={isExpanded} unmountOnExit>
                            <Box
                              sx={{
                                ml: 7,
                                p: 3,
                                bgcolor: 'grey.50',
                                borderRadius: '8px',
                                border: 1,
                                borderColor: 'grey.200',
                              }}>
                              {/* Description */}
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Description
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 3 }}>
                                {step.description ||
                                  'No description available.'}
                              </Typography>

                              {/* Form Block */}
                              {step.hasForm && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 2 }}>
                                    Form
                                  </Typography>
                                  <Box
                                    sx={{
                                      p: 2,
                                      border: 1,
                                      borderColor: 'grey.300',
                                      borderRadius: '4px',
                                      bgcolor: 'background.paper',
                                    }}>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                      Form name: {step.title} Form
                                    </Typography>
                                    {step.formSubmitted ? (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          gap: 1,
                                          flexWrap: 'wrap',
                                        }}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() =>
                                            handleViewForm(step.id)
                                          }>
                                          View submitted form
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() =>
                                            handleEditForm(step.id)
                                          }>
                                          Edit
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="error"
                                          onClick={() =>
                                            handleDiscardForm(step.id)
                                          }>
                                          Discard submitted form
                                        </Button>
                                      </Box>
                                    ) : step.status === StepStatus.ACTIVE ? (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          gap: 1,
                                          flexWrap: 'wrap',
                                        }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() =>
                                            handleSubmitForm(step.id)
                                          }>
                                          Submit form
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() =>
                                            handleCompleteNow(step.id)
                                          }>
                                          Complete now
                                        </Button>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary">
                                        Form not yet available
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              )}

                              {/* Next Step Preview */}
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Next Step
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  {step.nextStep || '<Same as Template>'}
                                </Typography>
                              </Box>

                              {/* Expected Completion Date */}
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Expected Completion Date
                                </Typography>
                                {step.status === StepStatus.ACTIVE ? (
                                  <TextField
                                    type="date"
                                    size="small"
                                    value={step.expectedCompletion || ''}
                                    onChange={(e) =>
                                      handleChangeExpectedCompletion(
                                        step.id,
                                        e.target.value
                                      )
                                    }
                                    sx={{ width: 200 }}
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    {step.expectedCompletion || 'Not set'}
                                  </Typography>
                                )}
                              </Box>

                              {/* Make Current Button */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                }}>
                                <Button
                                  size="small"
                                  variant="text"
                                  color="primary"
                                  onClick={() =>
                                    handleMakeCurrent(step.id, step.title)
                                  }
                                  disabled={step.status === StepStatus.ACTIVE}>
                                  Make this current step
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Section 4: Possible Other Steps */}
            <Box sx={{ mx: 5, mb: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">Possible Other Steps</Typography>
                <Tooltip
                  title="You may override the workflow order and skip to a new step."
                  placement="top">
                  <InfoOutlinedIcon
                    sx={{ fontSize: 18, color: 'text.secondary' }}
                  />
                </Tooltip>
              </Box>

              <Paper variant="outlined" sx={{ borderRadius: '12px', p: 3 }}>
                {workflowInstance.possibleSteps.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}>
                    No optional steps available.
                  </Typography>
                ) : (
                  <>
                    <List disablePadding>
                      {workflowInstance.possibleSteps.map((step) => (
                        <ListItem
                          key={step.id}
                          sx={{
                            border: 1,
                            borderColor: 'grey.300',
                            borderRadius: '8px',
                            mb: 1,
                            '&:hover': { bgcolor: 'grey.50' },
                          }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {step.title}
                              </Typography>
                            }
                          />
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}>
                            {step.estimate && (
                              <Badge
                                badgeContent={step.estimate}
                                color="primary"
                                sx={{
                                  '& .MuiBadge-badge': {
                                    position: 'static',
                                    transform: 'none',
                                    borderRadius: '12px',
                                    px: 1,
                                  },
                                }}>
                                <Box />
                              </Badge>
                            )}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip
                                title="Set this as current step"
                                placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleMakeCurrent(step.id, step.title)
                                  }>
                                  <PlayArrowIcon />
                                </IconButton>
                              </Tooltip>
                              {step.hasForm && (
                                <Tooltip
                                  title="This step has an associated form"
                                  placement="top">
                                  <IconButton size="small" disabled>
                                    <ArticleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, textAlign: 'center', display: 'block' }}>
                      If a step has a form, the icon will be shown.
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>

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
