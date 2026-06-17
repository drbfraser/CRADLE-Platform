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
  archiveInstance,
  unArchiveInstance,
  completeInstance,
} from 'src/shared/api';
import WorkflowStatus from './components/WorkflowStatus/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog from './components/WorkflowConfirmDialog';
import { useWorkflowInstanceDetails } from 'src/shared/hooks/patient/useWorkflowInstanceDetails';
import WorkflowSelectStepModal from './components/WorkflowSelectStepModal';
import { useWorkflowInstanceActions } from 'src/shared/hooks/patient/useWorkflowInstanceActions';
import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const [openTemplateDetails, setOpenTemplateDetails] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
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
    confirmDialog,
    setConfirmDialog,
    snackbar,
    handleCloseSnackbar,
    workflowStepHistoryActions,
    nextOptions,
    openNextStepModal,
    handleCloseNextStepModal,
    handleCompleteFinalStep,
    handleCompleteAndStartNextStep,
    handleMakeCurrent,
  } = useWorkflowInstanceActions({
    instanceDetails,
    template,
    currentStep,
    reload,
  });

  const onCompleteAndStartNextStep = async (stepId: string) => {
    const expandedStepId = await handleCompleteAndStartNextStep(stepId);
    if (expandedStepId) {
      setExpandedStep(expandedStepId);
    }
  };

  const onCompleteFinalStep = async () => {
    await handleCompleteFinalStep();
    setExpandedStep(null);
  };

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

            <Box sx={{ mx: 5, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {instanceDetails?.description || 'N/A'}
              </Typography>
            </Box>

            <WorkflowStatus
              workflowInstance={instanceDetails}
              progressInfo={progressInfo}
            />

            <WorkflowStepHistory
              workflowInstance={instanceDetails}
              currentStep={currentStep}
              expandedStep={expandedStep}
              setExpandedStep={setExpandedStep}
              expandAll={expandAll}
              setExpandAll={setExpandAll}
              actions={workflowStepHistoryActions}
            />

            <WorkflowPossibleSteps
              workflowInstance={instanceDetails}
              handleMakeCurrent={handleMakeCurrent}
            />

            <Box sx={{ mx: 5, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Change Workflow Status
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: '12px', p: 3 }}>
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
              </Paper>
            </Box>

            <WorkflowConfirmDialog
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </>
        ) : null}
      </Paper>

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
        handleCompleteFinalStep={onCompleteFinalStep}
        handleCompleteAndStartNextStep={onCompleteAndStartNextStep}
        options={nextOptions}
      />
    </>
  );
}
