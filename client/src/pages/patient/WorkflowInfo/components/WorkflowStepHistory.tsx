import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Divider,
  IconButton,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  WorkflowStepHistoryActions,
} from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from '../utils';
import WorkflowFormModal from './WorkflowFormModal';
import StepHistoryActions from './StepHistoryActions';
import WorkflowStepHistoryItem from './WorkflowStepHistoryItem';

interface WorkflowStepHistoryProps {
  workflowInstance: InstanceDetails;
  currentStep: InstanceStep | null;
  expandedStep: string | null;
  setExpandedStep: (stepId: string | null) => void;
  expandAll: boolean;
  setExpandAll: (value: boolean) => void;
  actions: WorkflowStepHistoryActions;
  isEditable: boolean;
}

export default function WorkflowStepHistory({
  workflowInstance,
  currentStep,
  expandedStep,
  setExpandedStep,
  expandAll,
  setExpandAll,
  actions,
  isEditable,
}: WorkflowStepHistoryProps) {
  const [currentStepExpanded, setCurrentStepExpanded] = useState(true);

  const completedStepHistory = useMemo(
    () =>
      workflowInstance.stepHistory.filter(
        (step) => step.status !== StepStatus.ACTIVE
      ),
    [workflowInstance.stepHistory]
  );

  const completedStepsCount = workflowInstance.steps.filter(
    (s) => s.status === StepStatus.COMPLETED
  ).length;

  return (
    <>
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

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}>
                  {currentStep.description ?? 'No description available.'}
                </Typography>

                <StepHistoryActions
                  step={currentStep}
                  variant="current"
                  onViewForm={isEditable ? actions.formActions.onView : undefined}
                  onEditForm={isEditable ? actions.formActions.onEdit : undefined}
                  onDiscardForm={isEditable ? actions.formActions.onDiscard : undefined}
                  onCompleteNow={isEditable ? actions.formActions.onCompleteNow : undefined}
                  onCompleteStep={isEditable ? actions.stepActions.onCompleteStep : undefined}
                />
              </Box>
            </Collapse>
          </Paper>
        </Box>
      )}

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
          {completedStepsCount === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 4 }}>
              No steps recorded yet.
            </Typography>
          ) : (
            <Box sx={{ position: 'relative' }}>
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

              {completedStepHistory.map((step) => {
                const isExpanded = expandAll || expandedStep === step.id;

                return (
                  <WorkflowStepHistoryItem
                    key={step.id}
                    step={step}
                    isExpanded={isExpanded}
                    expandAll={expandAll}
                    onToggleExpand={() =>
                      setExpandedStep(isExpanded ? null : step.id)
                    }
                    onMakeCurrent={isEditable ? actions.stepActions.onMakeCurrent : undefined}
                  />
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>

      {actions.form.modalState.open && (
        <WorkflowFormModal
          currentStep={currentStep}
          formModalState={actions.form.modalState}
          onRefetchForm={actions.form.onRefetch}
          patientId={workflowInstance.patientId}
          handleCloseFormModal={actions.form.onClose}
        />
      )}
    </>
  );
}
