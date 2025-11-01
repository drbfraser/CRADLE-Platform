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
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  deleteFormResponseAsync,
  getFormTemplateLangAsync,
  getInstanceWithSteps,
  getPatientInfoAsync,
  getTemplateWithStepsAndClassification,
} from 'src/shared/api';
import { Nullable } from 'src/shared/constants';
import { formatISODateNumber } from 'src/shared/utils';
import {
  WorkflowInstance,
  WorkflowInstanceStep,
  WorkflowTemplate,
  WorkflowTemplateStep,
} from 'src/shared/types/workflow/workflowApiTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceStep,
  InstanceDetails,
  WorkflowInstanceProgress,
  FormModalState,
} from 'src/shared/types/workflow/workflowUiTypes';
import WorkflowStatus from './components/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog, {
  ConfirmDialogData,
} from './components/WorkflowConfirmDialog';
import { Patient } from 'src/shared/types/patientTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { useFormResponseQuery } from 'src/pages/customizedForm/queries';
import axios from 'axios';

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

function findTemplateStepById(
  templateStepId: string,
  template: WorkflowTemplate
) {
  return template.steps?.find((step) => step.id === templateStepId);
}

export function mapWorkflowStep(
  apiStep: WorkflowInstanceStep,
  template: WorkflowTemplate
): InstanceStep {
  const templateStep: WorkflowTemplateStep | undefined = findTemplateStepById(
    apiStep.workflowTemplateStepId,
    template
  );

  if (!templateStep) {
    throw new Error(
      `No template step found for id ${apiStep.workflowTemplateStepId}`
    );
  }

  const workflowInstanceStep: InstanceStep = {
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
  if (apiStep.form) workflowInstanceStep.form = apiStep.form;

  return workflowInstanceStep;
}

export function buildInstanceDetails(
  instance: WorkflowInstance,
  template: WorkflowTemplate,
  patient: Patient
): InstanceDetails {
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
    steps: instance.steps.map((step) => mapWorkflowStep(step, template)),
    possibleSteps: [],
  };

  return instanceDetails;
}

function getWorkflowCurrentStep(instance: InstanceDetails) {
  const steps = instance.steps;
  const currentStep = steps.find((step) => step.status === StepStatus.ACTIVE);
  return currentStep;
}

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [instanceDetails, setInstanceDetails] =
    useState<InstanceDetails | null>(null);
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
  const [formModalState, setFormModalState] = useState<FormModalState>({
    open: false,
    renderState: FormRenderStateEnum.FIRST_SUBMIT,
    form: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [reloadFlag, setReloadFlag] = useState(false);

  const formResponseQuery = useFormResponseQuery(currentStep?.formId || '');

  useEffect(() => {
    async function fetchInstanceAndPatient() {
      try {
        const instance = await getInstanceWithSteps('test-workflow-instance-1'); //TODO: To be updated with URL param when completed
        setInstance(instance);

        const patient = await getPatientInfoAsync(instance.patientId);
        setPatient(patient);
      } catch (err) {
        console.error(
          'Failed to load workflow instance and patient details',
          err
        );
      }
    }
    fetchInstanceAndPatient();
  }, [instanceId, reloadFlag]);

  const fetchTemplate = useCallback(async (templateId: string) => {
    const template = await getTemplateWithStepsAndClassification(templateId);
    setTemplate(template);
  }, []);

  useEffect(() => {
    if (instance?.workflowTemplateId) {
      fetchTemplate(instance.workflowTemplateId);
    }
  }, [instance?.workflowTemplateId, fetchTemplate]);

  useEffect(() => {
    function setupInstanceDetails() {
      if (instance && template && patient) {
        const instanceDetails = buildInstanceDetails(
          instance,
          template,
          patient
        );
        setInstanceDetails(instanceDetails);
      }
    }
    setupInstanceDetails();
  }, [instanceId, instance, template, patient]);

  useEffect(() => {
    if (!instanceDetails) return;

    const activeStep = getWorkflowCurrentStep(instanceDetails);
    setCurrentStep(activeStep ?? null);
    console.log(`Current Step Set, id: ${activeStep?.id}`);

    const progress = computeProgressAndEta(instanceDetails.steps);
    setProgressInfo(progress);
  }, [instanceDetails]);

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

  const handleOpenFormModal = async (formRenderState: FormRenderStateEnum) => {
    if (!currentStep) {
      console.error('No current step available to open form.');
      return;
    }

    switch (formRenderState) {
      case FormRenderStateEnum.FIRST_SUBMIT: {
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
          setFormModalState({
            open: true,
            renderState: formRenderState,
            form: formTemplate,
          });
          return;
        } catch {
          console.error('Error in getting form template');
          return;
        }
      }
      case FormRenderStateEnum.VIEW:
      case FormRenderStateEnum.EDIT: {
        if (!currentStep.formId) {
          console.error('No submitted form associated with current step.');
          return;
        }

        const formResponse = formResponseQuery.data;
        if (!formResponse) {
          console.error('Error in getting form');
          return;
        }

        setFormModalState({
          open: true,
          renderState: formRenderState,
          form: formResponse,
        });

        return;
      }
      default:
        console.error('Invalid form modal render state');
        return;
    }
  };

  const handleCloseFormModal = () => {
    console.log('Closing Form Modal');
    setFormModalState({
      open: false,
      renderState: FormRenderStateEnum.FIRST_SUBMIT,
      form: null,
    });
    setReloadFlag((prev) => !prev);
  };

  const onRefetchForm = () => {
    formResponseQuery.refetch();
  };

  const handleDeleteForm = async () => {
    try {
      if (!currentStep) {
        console.error('Error deleting form (no current step)');
        return false;
      }

      if (!currentStep.formId) {
        console.error('No form associated with current step');
        return false;
      }

      await deleteFormResponseAsync(currentStep.formId);
      console.log('Discarded form for current step successfully.');
      setReloadFlag((prev) => !prev);
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error deleting form for current step:',
          error.response?.status,
          error.message
        );
      } else {
        console.log('Unknown error deleting form:', error);
      }
      return false;
    }
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

        {!instanceDetails ? (
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
                  {instanceDetails.studyTitle}
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
                Patient: {instanceDetails.patientName} (ID:{' '}
                {instanceDetails.patientId})
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
                    description={instanceDetails.description}
                    collectionName={instanceDetails.collection}
                    version={parseInt(instanceDetails.version) || 1}
                    lastEdited={instanceDetails.lastEditedOn}
                    dateCreated={instanceDetails.firstCreatedOn}
                  />
                </Box>
              </Box>
            </Collapse>
            {/* Section 2: Workflow Status */}
            <WorkflowStatus
              workflowInstance={instanceDetails}
              progressInfo={progressInfo}
            />

            {/* Section 3: Step history */}
            <WorkflowStepHistory
              workflowInstance={instanceDetails}
              expandedStep={expandedStep}
              setExpandedStep={setExpandedStep}
              expandAll={expandAll}
              setExpandAll={setExpandAll}
              setConfirmDialog={setConfirmDialog}
              handleMakeCurrent={handleMakeCurrent}
              handleOpenFormModal={handleOpenFormModal}
              handleCloseFormModal={handleCloseFormModal}
              formModalState={formModalState}
              onRefetchForm={onRefetchForm}
              handleDeleteForm={handleDeleteForm}
              currentStep={currentStep}
            />

            {/* Section 4: Possible Other Steps */}
            <WorkflowPossibleSteps
              workflowInstance={instanceDetails}
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
