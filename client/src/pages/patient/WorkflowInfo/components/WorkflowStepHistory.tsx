import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Chip,
  TextField,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IconButton } from '@mui/material';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { InstanceDetails, InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from '../WorkflowUtils';
import WorkflowFormModal from './WorkflowFormModal';
import { CForm } from 'src/shared/types/form/formTypes';

export default function WorkflowStepHistory(props: {
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
  handleMakeCurrent: (stepId: string, title: string) => void;
  handleOpenForm: () => void;
  openFormModal: boolean,
  formData: CForm | null
  handleCloseForm: () => void;
}) {
  const {
    workflowInstance,
    expandedStep,
    setExpandedStep,
    expandAll,
    setExpandAll,
    setConfirmDialog,
    handleMakeCurrent,
    handleOpenForm,
    openFormModal,
    formData,
    handleCloseForm
  } = props;

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

  const handleCompleteNow = React.useCallback((step: InstanceStep) => {
    console.log('Complete now for step:', step.id);
    handleOpenForm()
    // Retrieve related form
    // Pass to modal component?
    // Set form modal to open

    
  }, []);

  const handleChangeExpectedCompletion = React.useCallback(
    (stepId: string, date: string) => {
      console.log('Change expected completion for step:', stepId, 'to:', date);
    },
    []
  );

  return (
    <>
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
                          {formatWorkflowStepStatusText(step)}
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
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                          {step.description || 'No description available.'}
                        </Typography>

                        {/* Form Block */}
                        {step.hasForm && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
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
                                    onClick={() => handleViewForm(step.id)}>
                                    View submitted form
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleEditForm(step.id)}>
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDiscardForm(step.id)}>
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
                                    onClick={() => handleSubmitForm(step.id)}>
                                    Submit form
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleCompleteNow(step)}>
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
                          <Typography variant="body2" color="text.secondary">
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
                            <Typography variant="body2" color="text.secondary">
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

      {formData && 
        <WorkflowFormModal 
          openFormModal={openFormModal}
          form={formData}
          patientId={workflowInstance.patientId}
          handleCloseForm = {handleCloseForm}
        />
      }
    </>
  );
}
