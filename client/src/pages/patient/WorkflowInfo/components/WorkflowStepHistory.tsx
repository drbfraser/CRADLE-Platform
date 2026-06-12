import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IconButton } from '@mui/material';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  FormModalState,
  InstanceDetails,
  InstanceStep,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  formatWorkflowStepStatusText,
  getWorkflowStepHistory,
} from '../WorkflowUtils';
import WorkflowFormModal from './WorkflowFormModal';
import { CheckCircle } from '@mui/icons-material';
import { FormRenderStateEnum, SnackbarSeverity } from 'src/shared/enums';

interface IProps {
  workflowInstance: InstanceDetails;
  expandedStep: string | null;
  setExpandedStep: (stepId: string | null) => void;
  expandAll: boolean;
  setExpandAll: (value: boolean) => void;
  setConfirmDialog: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
    }>
  >;
  handleMakeCurrent: (
    stepId: string,
    title: string,
    status: StepStatus
  ) => void;
  handleOpenFormModal: (formRenderState: FormRenderStateEnum) => void;
  handleCloseFormModal: () => void;
  formModalState: FormModalState;
  onRefetchForm: () => void;
  handleArchiveForm: () => Promise<boolean>;
  currentStep: InstanceStep | null;
  showSnackbar: (message: string, severity: SnackbarSeverity) => void;
  handleOpenNextStepModal: () => void;
}

export default function WorkflowStepHistory({
  workflowInstance,
  expandedStep,
  setExpandedStep,
  expandAll,
  setExpandAll,
  setConfirmDialog,
  handleMakeCurrent,
  handleOpenFormModal,
  handleCloseFormModal,
  formModalState,
  onRefetchForm,
  handleArchiveForm,
  currentStep,
  showSnackbar,
  handleOpenNextStepModal,
}: IProps) {
  const [currentStepExpanded, setCurrentStepExpanded] = useState(true);

  const handleViewForm = (stepId: string) => {
    handleOpenFormModal(FormRenderStateEnum.VIEW);
  };

  const handleEditForm = (stepId: string) => {
    handleOpenFormModal(FormRenderStateEnum.EDIT);
  };

  const handleDiscardForm = (stepId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Discard Form',
      message:
        'Are you sure you want to discard the submitted form? This action cannot be undone.',
      onConfirm: async () => {
        const result = await handleArchiveForm();

        if (result) {
          showSnackbar(
            'Form discarded successfully!',
            SnackbarSeverity.SUCCESS
          );
        } else {
          showSnackbar(
            'Error discarding form. Please try again.',
            SnackbarSeverity.ERROR
          );
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleCompleteNow = () => {
    handleOpenFormModal(FormRenderStateEnum.FIRST_SUBMIT);
  };

  // TODO
  // const handleChangeExpectedCompletion = (stepId: string, date: string) => {
  //   console.log('Change expected completion for step:', stepId, 'to:', date);
  // };

  return (
    <>
      {/* Current Step Card */}
      {currentStep && (
        <Box sx={{ mx: 5, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Step
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: '12px' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                p: 2,
                borderRadius: '12px',
                '&:hover': { bgcolor: 'grey.50' },
              }}
              onClick={() => setCurrentStepExpanded(!currentStepExpanded)}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  border: 2,
                  borderColor: 'primary.main',
                  borderRadius: '50%',
                  mr: 3,
                }}>
                <ReplayIcon color="primary" sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {currentStep.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  {formatWorkflowStepStatusText(currentStep)}
                </Typography>
                {currentStep.expectedCompletion && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}>
                    Expected completion: {currentStep.expectedCompletion}
                  </Typography>
                )}
              </Box>
              <IconButton size="small" sx={{ ml: 1 }}>
                {currentStepExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={currentStepExpanded} unmountOnExit>
              <Box sx={{ px: 3, pb: 3 }}>
                <Divider sx={{ mb: 2 }} />

                {/* Description */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}>
                  {currentStep.description ?? 'No description available.'}
                </Typography>

                {/* Form Block */}
                {currentStep.formTemplateId && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        {currentStep.title} Form
                        {currentStep.formSubmitted && (
                          <Chip
                            icon={<CheckCircle />}
                            size="small"
                            label="Completed"
                            color="success"
                            variant="filled"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      {currentStep.formSubmitted && currentStep.formId ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={() => handleViewForm(currentStep.id)}>
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditForm(currentStep.id)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              handleDiscardForm(currentStep.formId!)
                            }>
                            Discard
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCompleteNow()}>
                            Complete now
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Complete Step Button */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 2,
                  }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleOpenNextStepModal}>
                    Complete Step
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Box>
      )}

      {/* Section 3: Step history */}
      <Box sx={{ mx: 5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
          {workflowInstance.steps.filter(
            (s) => s.status === StepStatus.COMPLETED
          ).length === 0 ? (
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

              {getWorkflowStepHistory(workflowInstance)
                .filter((step) => step.status !== StepStatus.ACTIVE)
                .map((step) => {
                  /* TODO: make workflow completion independent of workflow.step.length and move 
                   getWorkflowStepHistory to WorkflowUtils.tsx when building workflow instance 
                   to minimize rendering inefficiencies */
                  const isExpanded = expandAll || expandedStep === step.id;

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
                            borderColor: 'success.main',
                            borderRadius: '50%',
                            mr: 3,
                          }}>
                          <CheckCircleOutlineIcon
                            color="success"
                            sx={{ fontSize: 24 }}
                          />
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
                            {formatWorkflowStepStatusText(step)}
                          </Typography>
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
                            {step.description ?? 'No description available.'}
                          </Typography>

                          {/* Form Block */}
                          {step.formTemplateId && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}>
                                  {step.title} Form
                                  {step.formSubmitted && (
                                    <Chip
                                      icon={<CheckCircle />}
                                      size="small"
                                      label="Completed"
                                      color="success"
                                      variant="filled"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Make Current Button */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              mt: 2,
                            }}>
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                              onClick={() =>
                                handleMakeCurrent(
                                  step.id,
                                  step.title,
                                  step.status
                                )
                              }>
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

      {formModalState.open && (
        <WorkflowFormModal
          currentStep={currentStep}
          formModalState={formModalState}
          onRefetchForm={onRefetchForm}
          patientId={workflowInstance.patientId}
          handleCloseFormModal={handleCloseFormModal}
        />
      )}
    </>
  );
}
