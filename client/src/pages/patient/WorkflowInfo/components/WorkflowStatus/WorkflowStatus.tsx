import { Box } from '@mui/material';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import { isWorkflowInstanceCompleted } from '../../utils/workflowProgressText';
import WorkflowStatusSummary from './WorkflowStatusSummary';
import CurrentStepPanel from './CurrentStepPanel';

export default function WorkflowStatus(props: {
  workflowInstance: InstanceDetails;
  progressInfo: WorkflowInstanceProgress;
}) {
  const { workflowInstance, progressInfo } = props;
  const currentStep = workflowInstance.steps[progressInfo.currentIndex];
  const isCompleted = isWorkflowInstanceCompleted(workflowInstance);

  return (
    <Box sx={{ mx: 5, mb: 3 }}>
      <Box
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
        }}>
        <WorkflowStatusSummary
          workflowInstance={workflowInstance}
          progressInfo={progressInfo}
        />

        {!isCompleted && currentStep && (
          <CurrentStepPanel step={currentStep} progressInfo={progressInfo} />
        )}
      </Box>
    </Box>
  );
}
