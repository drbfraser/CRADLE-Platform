// src/pages/patient/WorkflowInstanceDetails.tsx
import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { Tooltip, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFormTemplateLangAsync,
  getInstanceWithSteps,
  getPatientInfoAsync,
  getTemplate,
  getTemplateStepById,
} from 'src/shared/api';
import { Nullable } from 'src/shared/constants';
import { formatISODateNumber } from 'src/shared/utils';
import {
  WorkflowInstanceStep,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceStep,
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import WorkflowStatus from './components/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog, {
  ConfirmDialogData,
} from './components/WorkflowConfirmDialog';
import { CForm } from 'src/shared/types/form/formTypes';

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

export async function mapWorkflowStep(
  apiStep: WorkflowInstanceStep
): Promise<InstanceStep> {
  const templateStep = await getTemplateStepById(
    apiStep.workflowTemplateStepId
  );

  var workflowInstanceStep: InstanceStep = {
    id: apiStep.id,
    title: apiStep.name,
    status: apiStep.status,
    startedOn: formatISODateNumber(apiStep.startDate),
    completedOn: apiStep.completionDate
      ? formatISODateNumber(apiStep.completionDate)
      : null,
    description: apiStep.description,
    expectedCompletion: apiStep.expectedCompletion
      ? formatISODateNumber(apiStep.expectedCompletion)
      : null,
    // nextStep?: string;  // TODO: Not implemented in backend yet
    formSubmitted: apiStep.formId ? true : false,
    workflowTemplateStepId: apiStep.workflowTemplateStepId,
  };

  if (templateStep.formId)
    workflowInstanceStep.formTemplateId = templateStep.formId;

  if (apiStep.formId) workflowInstanceStep.formId = apiStep.formId;

  return workflowInstanceStep;
}

export async function loadInstanceAndTemplateByInstanceId(
  id: string
): Promise<{ instance: InstanceDetails; template: WorkflowTemplate }> {
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
    steps: await Promise.all(
      instance.steps.map((step) => mapWorkflowStep(step))
    ),
    possibleSteps: [],
  };

  return { instance: instanceDetails, template: template };
}

function getWorkflowCurrentStep(instance: InstanceDetails) {
  const steps = instance.steps;
  const currentStep = steps.find((step) => step.status === StepStatus.ACTIVE);
  return currentStep;
}

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [workflowInstance, setWorkflowInstance] =
    useState<InstanceDetails | null>(null);
  const [workflowTemplate, setWorkflowTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [progressInfo, setProgressInfo] = useState<WorkflowInstanceProgress>({
    total: 0,
    completed: 0,
    percent: 0,
    estDaysRemaining: 0,
    currentIndex: 0,
  });
  const navigate = useNavigate();
  const [openTemplateDetails, setOpenTemplateDetails] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [currentStep, setCurrentStep] = useState<InstanceStep | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [formTemplate, setFormTemplate] = useState<CForm | null>(null);
  const [reloadFlag, setReloadFlag] = useState(false);

  useEffect(() => {
    async function fetchInstance() {
      try {
        const { instance, template } =
          await loadInstanceAndTemplateByInstanceId('test-workflow-instance-1'); //TODO: To be updated with URL param when completed
        setWorkflowInstance(instance);
        setWorkflowTemplate(template);
        const activeStep = getWorkflowCurrentStep(instance);
        setCurrentStep(activeStep ?? null);
        console.log(`Current Step Set, id: ${currentStep?.id}`);
        const progress = computeProgressAndEta(instance.steps);
        setProgressInfo(progress);
      } catch (err) {
        console.error('Failed to load workflow instance', err);
      }
    }
    fetchInstance();
  }, [instanceId, reloadFlag]);

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

  const handleOpenFormModal = async () => {
    if (!currentStep) {
      console.error('No current step available to open form.');
      return;
    }

    if (!currentStep.formTemplateId) {
      console.error('No form associated with current step.');
      return;
    }

    try {
      const formTemplateId = currentStep.formTemplateId;
      const formTemplate = await getFormTemplateLangAsync(
        formTemplateId,
        'English'
      );
      setFormTemplate(formTemplate);
      setIsFormModalOpen(true);
    } catch {
      console.error('Error in getting form template');
    }
  };

  const handleCloseFormModal = () => {
    console.log('Closing Form Modal');
    setFormTemplate(null);
    setIsFormModalOpen(false);
    setReloadFlag((prev) => !prev);
  };

  return (
    <>
      {/* Main Workflow Instance Name Heading */}
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
            {/* Workflow Instance Name & Patient Heading */}
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
                    openTemplateDetails ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )
                  }
                  onClick={() => setOpenTemplateDetails((v) => !v)}
                  sx={{ textTransform: 'none' }}>
                  {openTemplateDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </Box>

              <Typography variant="h6" color="text.secondary">
                Patient: {workflowInstance.patientName} (ID:{' '}
                {workflowInstance.patientId})
              </Typography>
            </Box>

            {/* Collapsible Workflow Template Details */}
            <Collapse in={openTemplateDetails} unmountOnExit>
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
              handleOpenFormModal={handleOpenFormModal}
              handleCloseFormModal={handleCloseFormModal}
              isFormModalOpen={isFormModalOpen}
              formTemplate={formTemplate}
              currentStep={currentStep}
            />

            {/* Section 4: Possible Other Steps */}
            <WorkflowPossibleSteps
              workflowInstance={workflowInstance}
              handleMakeCurrent={handleMakeCurrent}
            />

            {/* Confirmation Dialog */}
            <WorkflowConfirmDialog
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </>
        )}
      </Paper>
    </>
  );
}
