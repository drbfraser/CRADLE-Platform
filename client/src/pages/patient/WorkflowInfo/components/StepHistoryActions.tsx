import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';

type StepHistoryActionsProps = {
  step: InstanceStep;
  variant: 'current' | 'history';
  onViewForm?: () => void;
  onEditForm?: () => void;
  onDiscardForm?: () => void;
  onCompleteNow?: () => void;
  onCompleteStep?: () => void;
  onMakeCurrent?: () => void;
};

export default function StepHistoryActions({
  step,
  variant,
  onViewForm,
  onEditForm,
  onDiscardForm,
  onCompleteNow,
  onCompleteStep,
  onMakeCurrent,
}: StepHistoryActionsProps) {
  const showFormActions = variant === 'current';

  return (
    <>
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
              sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
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
            {showFormActions &&
              (step.formSubmitted && step.formId ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    color="primary"
                    variant="contained"
                    onClick={onViewForm}>
                    View
                  </Button>
                  <Button size="small" variant="outlined" onClick={onEditForm}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={onDiscardForm}>
                    Discard
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={onCompleteNow}>
                    Complete now
                  </Button>
                </Box>
              ))}
          </Box>
        </Box>
      )}

      {variant === 'current' && onCompleteStep && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
          }}>
          <Tooltip
            title={
              step.formTemplateId && !step.formSubmitted
                ? 'Submit the form before completing this step'
                : ''
            }>
            <span>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={!!step.formTemplateId && !step.formSubmitted}
                onClick={onCompleteStep}>
                Complete Step
              </Button>
            </span>
          </Tooltip>
        </Box>
      )}

      {variant === 'history' && onMakeCurrent && (
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
            onClick={onMakeCurrent}>
            Make this current step
          </Button>
        </Box>
      )}
    </>
  );
}
