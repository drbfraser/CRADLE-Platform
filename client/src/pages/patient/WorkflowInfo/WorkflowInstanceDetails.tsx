// src/pages/patient/WorkflowInstanceDetails.tsx
import * as React from 'react';
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
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  applyInstanceStepAction,
  archiveInstanceStepForm,
  getInstanceActions,
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
import WorkflowRecommendationBanner, {
  RecommendationBannerData,
} from './components/WorkflowRecommendationBanner';
import { InstanceStepAction } from 'src/shared/types/workflow/workflowEnums';
import {
  ApplyInstanceStepActionRequest,
  WorkflowInstanceAction,
} from 'src/shared/types/workflow/workflowApiTypes';
import { getWorkflowStepWithId } from './WorkflowUtils';
import WorkflowSelectStepModal from './components/WorkflowSelectStepModal';

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
  const [recommendation, setRecommendation] =
    useState<RecommendationBannerData>({
      open: false,
      hasNextStep: false,
      message: '',
    });
  const [stepActions, setStepActions] = useState<WorkflowInstanceAction[]>([]);
  const [nextStep, setNextStep] = useState<string | null>(null);
  const [openNextStepModal, setOpenNextStepModal] = useState<boolean>(false);

  const { instanceDetails, currentStep, progressInfo, reload } =
    useWorkflowInstanceDetails(instanceId!);
  const {
    formModalState,
    handleOpenFormModal,
    handleCloseFormModal,
    onRefetchForm,
  } = useWorkflowFormModal(currentStep, reload);

  // TODO: add setCurrentStep function inside useWorkflowInstanceDetails
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

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenRecommendation = (newActions: WorkflowInstanceAction[]) => {
    // TODO: Pass next action to recommendation banner
    const recommendedStep = getWorkflowStepWithId(
      newActions[0].stepId,
      instanceDetails!
    );

    setRecommendation({
      open: true,
      hasNextStep: recommendedStep ? true : false,
      message: recommendedStep
        ? `Continue to ${recommendedStep.title}.`
        : 'No recommended next step.',
    });
  };

  const handleCloseRecommendation = () => {
    setRecommendation({ open: false, message: '' });
  };

  const handleGoToStep = () => {
    setExpandedStep('test-workflow-instance-1-step2'); // TODO: To be replaced by recommended step ID from backend once implemented
    handleCloseRecommendation();
  };

  const handleApplyStepAction = async (
    actionType: InstanceStepAction,
    stepId: string
  ) => {
    const payload: ApplyInstanceStepActionRequest = {
      action: {
        type: actionType,
        step_id: stepId,
      },
    };
    const response = await applyInstanceStepAction(
      instanceDetails!.id,
      payload
    );

    return response;
  };

  const handleCompleteStep = async () => {
    try {
      await handleApplyStepAction(InstanceStepAction.COMPLETE, currentStep!.id);
      await reload();
      const newActions = await getInstanceActions(instanceDetails!.id);
      setStepActions(newActions);

      showSnackbar('Step completed!', SnackbarSeverity.SUCCESS);
      handleOpenRecommendation(newActions);
      setExpandedStep(null);
    } catch (e) {
      console.error('Unable to complete step', e);
      showSnackbar('Unable to complete step', SnackbarSeverity.ERROR);
    }
  };

  const handleOpenNextStepModal = () => {
    setOpenNextStepModal(true);
  };

  const handleCloseNextStepModal = () => {
    setOpenNextStepModal(false);
  };

  const handleSelectNextStep = async (stepId: string) => {
    // TO COMPLETE
    // await handleApplyStepAction(InstanceStepAction.START, "test-workflow-inst"); // TODO: To put in actual step id
    // await reload();
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
              handleArchiveForm={handleArchiveForm}
              currentStep={currentStep}
              showSnackbar={showSnackbar}
              handleCompleteStep={handleCompleteStep}
              handleOpenNextStepModal={handleOpenNextStepModal}
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

      {/* Banner for Next Step Recommendation */}
      <WorkflowRecommendationBanner
        recommendation={recommendation}
        handleClose={handleCloseRecommendation}
        handleGoToStep={handleGoToStep}
      />

      <WorkflowSelectStepModal
        open={openNextStepModal}
        handleCloseNextStepModal={handleCloseNextStepModal}
      />
    </>
  );
}
