import { Box, Collapse, IconButton, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from '../utils';
import StepHistoryActions from './StepHistoryActions';
import StepDescription from 'src/shared/components/workflow/StepDescription';

type WorkflowStepHistoryItemProps = {
  step: InstanceStep;
  isExpanded: boolean;
  expandAll: boolean;
  onToggleExpand: () => void;
  onMakeCurrent?: (stepId: string, title: string, status: StepStatus) => void;
};

export default function WorkflowStepHistoryItem({
  step,
  isExpanded,
  expandAll,
  onToggleExpand,
  onMakeCurrent,
}: WorkflowStepHistoryItemProps) {
  return (
    <Box sx={{ position: 'relative', mb: 3 }}>
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
        onClick={() => !expandAll && onToggleExpand()}>
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
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {step.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {formatWorkflowStepStatusText(step)}
          </Typography>
        </Box>

        {!expandAll && (
          <IconButton size="small" sx={{ ml: 1 }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Description
          </Typography>
          <Box sx={{ mb: 3 }}>
            <StepDescription description={step.description} />
          </Box>

          <StepHistoryActions
            step={step}
            variant="history"
            onMakeCurrent={
              onMakeCurrent
                ? () => onMakeCurrent(step.id, step.title, step.status)
                : undefined
            }
          />
        </Box>
      </Collapse>
    </Box>
  );
}
