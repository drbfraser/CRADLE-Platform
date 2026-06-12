import { Box, Typography, Grid } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
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

  return (
    <Box sx={{ mx: 5, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Workflow Status
      </Typography>

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
                workflowInstance.workflowCompletedOn ? (
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
              label={
                workflowInstance.workflowCompletedOn
                  ? 'Completed'
                  : 'Last Edited'
              }
              value={
                workflowInstance.workflowCompletedOn ||
                workflowInstance.lastEditedOn
              }
              caption={
                !workflowInstance.workflowCompletedOn ? (
                  <Typography variant="caption" color="text.secondary">
                    by {workflowInstance.lastEditedBy || 'N/A'}
                  </Typography>
                ) : undefined
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatusStatCard
              icon={
                <ReplayIcon
                  color={
                    workflowInstance.workflowCompletedOn ? 'success' : 'primary'
                  }
                  sx={{ fontSize: 32, mb: 1 }}
                />
              }
              label="Progress"
              value={
                <>
                  {progressInfo.completed} /{' '}
                  {workflowInstance.workflowCompletedOn
                    ? progressInfo.completed
                    : progressInfo.completed + (shortestPath || 0)}
                  {workflowInstance.workflowCompletedOn ? '' : '+'}
                </>
              }
              caption={
                <Typography variant="caption" color="text.secondary">
                  {workflowInstance.workflowCompletedOn
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
        </Grid>

        {!workflowInstance.workflowCompletedOn && currentStep && (
          <CurrentStepPanel step={currentStep} progressInfo={progressInfo} />
        )}
      </Box>
    </Box>
  );
}
