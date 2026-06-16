import { Box, Typography } from '@mui/material';
import {
  InstanceStep,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from '../../utils';

type CurrentStepPanelProps = {
  step: InstanceStep;
  progressInfo: WorkflowInstanceProgress;
};

export default function CurrentStepPanel({
  step,
  progressInfo,
}: CurrentStepPanelProps) {
  return (
    <Box
      sx={{
        borderLeft: 4,
        borderLeftColor: 'primary.main',
        p: 2,
        borderRadius: 4,
      }}>
      <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>
        Currently Working On:
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {step.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {formatWorkflowStepStatusText(step)}
      </Typography>
      {progressInfo.etaDate && (
        <Typography variant="caption" color="text.secondary">
          ~{progressInfo.estDaysRemaining} days remaining
        </Typography>
      )}
    </Box>
  );
}
