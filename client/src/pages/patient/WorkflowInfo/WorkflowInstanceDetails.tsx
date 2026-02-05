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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { Tooltip, IconButton } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { archiveInstanceStepForm } from 'src/shared/api';
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

  const { instanceDetails, template, currentStep, progressInfo, reload } =
    useWorkflowInstanceDetails(instanceId!);
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

  const { completeAndStartNextStep, completeFinalStep } =
    useWorkflowStepActions(
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

  // TODO: Placeholder function. To be implemented for overrides.
  const handleSetCurrentStep = useCallback((stepId: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: 'Override Current Step',
      message: `Override current step and move to ${title}?`,
      onConfirm: () => {
        console.log('Make current step:', stepId);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

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
                {instanceDetails?.description || "N/A"}
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

            {/* Confirmation Dialog */}
            <WorkflowConfirmDialog
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </>
        )}
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
