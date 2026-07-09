import { Grid } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Typography } from '@mui/material';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  formatWorkflowProgressValue,
  formatWorkflowRemainingStepsText,
  isWorkflowInstanceCompleted,
} from '../../utils/workflowProgressText';
import { getWorkflowShortestPath } from '../../utils';
import StatusStatCard from './StatusStatCard';

type WorkflowStatusSummaryProps = {
  workflowInstance: InstanceDetails;
  progressInfo: WorkflowInstanceProgress;
};

export default function WorkflowStatusSummary({
  workflowInstance,
  progressInfo,
}: WorkflowStatusSummaryProps) {
  const shortestPath = getWorkflowShortestPath(workflowInstance);
  const isCompleted = isWorkflowInstanceCompleted(workflowInstance);

  return (
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
          value={formatWorkflowProgressValue(
            workflowInstance,
            progressInfo,
            shortestPath
          )}
          caption={
            <Typography variant="caption" color="text.secondary">
              {formatWorkflowRemainingStepsText(
                workflowInstance,
                progressInfo,
                shortestPath
              )}
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
  );
}
