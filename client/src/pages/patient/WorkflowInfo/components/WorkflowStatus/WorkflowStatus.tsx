import { Box, Grid } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Typography } from '@mui/material';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';
import { getWorkflowShortestPath } from '../../utils';
import StatusStatCard from './StatusStatCard';
import CurrentStepPanel from './CurrentStepPanel';

export default function WorkflowStatus(props: {
  workflowInstance: InstanceDetails;
  progressInfo: WorkflowInstanceProgress;
}) {
  const { workflowInstance, progressInfo } = props;
  const currentStep = workflowInstance.steps[progressInfo.currentIndex];
  const shortestPath = getWorkflowShortestPath(workflowInstance);
  const remainingSteps =
    shortestPath || workflowInstance.steps.length - progressInfo.completed;
  const isCompleted =
    workflowInstance.status === InstanceStatus.COMPLETED;

  return (
    <Box sx={{ mx: 5, mb: 3 }}>
      <Box
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
        }}>
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <StatusStatCard
              icon={
                <CalendarTodayOutlinedIcon
                  color="success"
                  sx={{ fontSize: 32, mb: 1 }}
                />
              }
              label="Started"
              value={workflowInstance.workflowStartedOn}
              caption={
                <Typography variant="caption" color="text.secondary">
                  by {workflowInstance.workflowStartedBy}
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatusStatCard
              icon={
                <ReplayIcon
                  color={isCompleted ? 'success' : 'primary'}
                  sx={{ fontSize: 32, mb: 1 }}
                />
              }
              label="Progress"
              value={
                <>
                  {progressInfo.completed} /{' '}
                  {isCompleted
                    ? progressInfo.completed
                    : progressInfo.completed + (shortestPath || 0)}
                  {isCompleted ? '' : '+'}
                </>
              }
              caption={
                <Typography variant="caption" color="text.secondary">
                  {isCompleted
                    ? 'All steps completed'
                    : `At least ${remainingSteps} more step${
                        remainingSteps !== 1 ? 's' : ''
                      } remaining`}
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatusStatCard
              icon={
                isCompleted ? (
                  <CheckCircleOutlineIcon
                    color="success"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                ) : (
                  <HourglassEmptyIcon
                    color="disabled"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                )
              }
              label={isCompleted ? 'Completed' : 'Last Edited'}
              value={
                workflowInstance.workflowCompletedOn ||
                workflowInstance.lastEditedOn
              }
              caption={
                !isCompleted ? (
                  <Typography variant="caption" color="text.secondary">
                    by {workflowInstance.lastEditedBy || 'N/A'}
                  </Typography>
                ) : undefined
              }
            />
          </Grid>
        </Grid>

        {!isCompleted && currentStep && (
          <CurrentStepPanel step={currentStep} progressInfo={progressInfo} />
        )}
      </Box>
    </Box>
  );
}
