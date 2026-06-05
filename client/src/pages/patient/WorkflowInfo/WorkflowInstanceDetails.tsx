// src/pages/patient/WorkflowInstanceDetails.tsx
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { Tooltip, IconButton } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  archiveInstanceStepForm,
  archiveInstance,
  unArchiveInstance,
  completeInstance,
} from 'src/shared/api';
import WorkflowStatus from './components/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog, {
  ConfirmDialogData,
} from './components/WorkflowConfirmDialog';
import axios from 'axios';
import { useWorkflowInstanceDetails } from 'src/shared/hooks/patient/useWorkflowInstanceDetails';
import { useWorkflowFormModal } from 'src/shared/hooks/patient/useWorkflowFormModal';
import { SnackbarSeverity } from 'src/shared/enums';
import WorkflowSelectStepModal from './components/WorkflowSelectStepModal';
import { useWorkflowNextStepOptions } from 'src/shared/hooks/patient/useWorkflowNextStepOptions';
import { useWorkflowStepActions } from 'src/shared/hooks/patient/useWorkflowStepActions';
import { InstanceStatus, StepStatus } from 'src/shared/types/workflow/workflowEnums';

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const [openTemplateDetails, setOpenTemplateDetails] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: SnackbarSeverity.SUCCESS as SnackbarSeverity,
  });
  const [nextStep, setNextStep] = useState<string | null>(null);

  const {
    instanceDetails,
    template,
    currentStep,
    progressInfo,
    isLoading,
    error,
    reload,
  } = useWorkflowInstanceDetails(instanceId);
  const {
    formModalState,
    handleOpenFormModal,
    handleCloseFormModal,
    onRefetchForm,
  } = useWorkflowFormModal(currentStep, reload);

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const {
    nextOptions,
    currentStepEvaluation,
    openNextStepModal,
    handleOpenNextStepModal,
    handleCloseNextStepModal,
  } = useWorkflowNextStepOptions(
    instanceDetails,
    template,
    currentStep,
    showSnackbar
  );

  const {
    completeAndStartNextStep,
    completeFinalStep,
    setCurrentStep,
    overrideCompletedStep,
  } = useWorkflowStepActions(
    instanceDetails,
    currentStep,
    currentStepEvaluation,
    showSnackbar,
    reload
  );

  const handleArchiveForm = async () => {
    try {
      if (!currentStep) {
        console.error('Error deleting form (no current step)');
        return false;
      }

      if (!currentStep.formId) {
        console.error('No form associated with current step');
        return false;
      }

      await archiveInstanceStepForm(currentStep.id);
      console.log('Discarded form for current step successfully.');
      reload();
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

  const handleSetCurrentStep = async (
    stepId: string,
    title: string,
    status: StepStatus
  ) => {
    const statusNote =
      status === StepStatus.COMPLETED
        ? 'Note: A new step instance will be created.'
        : '';
    setConfirmDialog({
      open: true,
      title: 'Override Current Step',
      message: `Override current step and move to ${title}? ${statusNote}`,
      onConfirm: async () => {
        if (status === StepStatus.COMPLETED) {
          const { success } = await overrideCompletedStep(stepId);
          if (!success) return;
        } else {
          const { success } = await setCurrentStep(stepId);
          if (!success) return;
        }

        console.log('Make current step:', stepId);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleCompleteFinalStep = async () => {
    const { success } = await completeFinalStep();
    if (!success) return;

    handleCloseNextStepModal();
    setExpandedStep(null);
  };

  const handleCompleteAndStartNextStep = async (stepId: string) => {
    try {
      const { success } = await completeAndStartNextStep(stepId);
      if (!success) return;

      handleCloseNextStepModal();
      setExpandedStep(stepId);
      showSnackbar('Step completed!', SnackbarSeverity.SUCCESS);
    } catch (e) {
      console.error('Unable to complete step', e);
      showSnackbar('Unable to complete step', SnackbarSeverity.ERROR);
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
              {template
                ? `Workflow: ${template.classification?.name ?? template.name ?? 'Unknown'}`
                : 'Workflow Instance Details'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="h5" component="p">
              Loading workflow instance...
            </Typography>
          </Box>
        ) : error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={reload} sx={{ mr: 2 }}>
              Retry
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </Box>
        ) : instanceDetails ? (
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
                    version={instanceDetails.version}
                    lastEdited={new Date(
                      instanceDetails.lastEditedOn
                    ).getTime()}
                    dateCreated={new Date(
                      instanceDetails.firstCreatedOn
                    ).getTime()}
                  />
                </Box>
              </Box>
            </Collapse>

            {/*Show Description*/}
            <Box sx={{ mx: 5, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {instanceDetails?.description || 'N/A'}
              </Typography>
            </Box>

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
              handleMakeCurrent={handleSetCurrentStep}
              handleOpenFormModal={handleOpenFormModal}
              handleCloseFormModal={handleCloseFormModal}
              formModalState={formModalState}
              onRefetchForm={onRefetchForm}
              handleArchiveForm={handleArchiveForm}
              currentStep={currentStep}
              showSnackbar={showSnackbar}
              handleOpenNextStepModal={handleOpenNextStepModal}
            />

            {/* Section 4: Possible Other Steps */}
            <WorkflowPossibleSteps
              workflowInstance={instanceDetails}
              handleMakeCurrent={handleSetCurrentStep}
            />

            {/* Section 5: Change Workflow Status */}
            <Box sx={{ mx: 5, mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Change Workflow Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {instanceDetails.status === InstanceStatus.ACTIVE && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          title: 'Cancel Workflow',
                          message:
                            'Are you sure you want to cancel this workflow?',
                          onConfirm: async () => {
                            await archiveInstance(instanceDetails.id);
                            setConfirmDialog((prev) => ({
                              ...prev,
                              open: false,
                            }));
                            reload();
                          },
                        })
                      }>
                      Cancel Workflow
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          title: 'Mark Workflow Completed',
                          message:
                            'Are you sure you want to mark this workflow as completed?',
                          onConfirm: async () => {
                            await completeInstance(instanceDetails.id);
                            setConfirmDialog((prev) => ({
                              ...prev,
                              open: false,
                            }));
                            reload();
                          },
                        })
                      }>
                      Mark Workflow Completed
                    </Button>
                  </>
                )}
                {(instanceDetails.status === InstanceStatus.COMPLETED ||
                  instanceDetails.status === InstanceStatus.CANCELLED) && (
                  <Button
                    variant="contained"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: 'Make Workflow Active',
                        message:
                          'Are you sure you want to reactivate this workflow?',
                        onConfirm: async () => {
                          await unArchiveInstance(instanceDetails.id);
                          setConfirmDialog((prev) => ({
                            ...prev,
                            open: false,
                          }));
                          reload();
                        },
                      })
                    }>
                    Make Workflow Active
                  </Button>
                )}
              </Box>
            </Box>

            {/* Confirmation Dialog */}
            <WorkflowConfirmDialog
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </>
        ) : null}
      </Paper>

      {/* Snackbar for Confirmation Dialog */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          mb: '80px',
          borderRadius: 2,
        }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <WorkflowSelectStepModal
        open={openNextStepModal}
        nextStep={nextStep}
        setNextStep={setNextStep}
        handleCloseNextStepModal={handleCloseNextStepModal}
        handleCompleteFinalStep={handleCompleteFinalStep}
        handleCompleteAndStartNextStep={handleCompleteAndStartNextStep}
        options={nextOptions}
      />
    </>
  );
}
