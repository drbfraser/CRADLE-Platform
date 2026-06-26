import { Box, Button, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { archiveInstance, unArchiveInstance } from 'src/shared/api';
import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';
import WorkflowStatus from './components/WorkflowStatus/WorkflowStatus';
import WorkflowStepHistory from './components/WorkflowStepHistory';
import WorkflowPossibleSteps from './components/WorkflowPossibleSteps';
import WorkflowConfirmDialog from './components/WorkflowConfirmDialog';
import WorkflowInstanceHeader from './components/WorkflowInstanceHeader';
import WorkflowTemplateDetailsCollapse from './components/WorkflowTemplateDetailsCollapse';
import WorkflowDescription from './components/WorkflowDescription';
import WorkflowInstanceSnackbar from './components/WorkflowInstanceSnackbar';
import { useWorkflowInstanceDetails } from 'src/shared/hooks/patient/useWorkflowInstanceDetails';
import WorkflowSelectStepModal from './components/WorkflowSelectStepModal';
import { useWorkflowInstanceActions } from 'src/shared/hooks/patient/useWorkflowInstanceActions';
import { WorkflowNextStepOption } from 'src/shared/types/workflow/workflowUiTypes';

export default function WorkflowInstanceDetailsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
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
    handleMarkWorkflowComplete,
  } = useWorkflowInstanceActions({
    instanceDetails,
    template,
    currentStep,
    reload,
  });

  const pageTitle = template
    ? `Workflow: ${template.classification?.name ?? template.name ?? 'Unknown'}`
    : 'Workflow Instance Details';

  const onCompleteAndStartNextStep = async (option: WorkflowNextStepOption) => {
    const expandedStepId = await handleCompleteAndStartNextStep(option);
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
        <WorkflowInstanceHeader
          title={pageTitle}
          isLoading={isLoading}
          error={error}
          onBack={() => navigate(-1)}
          onRetry={reload}
        />

        {!isLoading && !error && instanceDetails && (
          <>
            <WorkflowTemplateDetailsCollapse
              instanceDetails={instanceDetails}
            />

            <WorkflowDescription description={instanceDetails.description} />

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
              actions={
                instanceDetails.status === InstanceStatus.ACTIVE
                  ? workflowStepHistoryActions
                  : {
                      ...workflowStepHistoryActions,
                      formActions: {
                        onView: undefined,
                        onEdit: undefined,
                        onDiscard: undefined,
                        onCompleteNow: undefined,
                      },
                      stepActions: {
                        onCompleteStep: undefined,
                        onMakeCurrent: undefined,
                      },
                    }
              }
            />

            {instanceDetails.status === InstanceStatus.ACTIVE && (
              <WorkflowPossibleSteps
                workflowInstance={instanceDetails}
                handleMakeCurrent={handleMakeCurrent}
              />
            )}

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
                              await handleMarkWorkflowComplete();
                              setConfirmDialog((prev) => ({
                                ...prev,
                                open: false,
                              }));
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
        )}
      </Paper>

      <WorkflowInstanceSnackbar
        snackbar={snackbar}
        onClose={handleCloseSnackbar}
      />

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
