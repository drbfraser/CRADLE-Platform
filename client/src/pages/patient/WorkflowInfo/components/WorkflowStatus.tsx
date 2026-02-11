import { Box, Typography, Grid } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import { formatWorkflowStepStatusText } from '../WorkflowUtils';

export default function WorkflowStatus(props: {
  workflowInstance: InstanceDetails;
  progressInfo: WorkflowInstanceProgress;
}) {
  const { workflowInstance, progressInfo } = props;

  return (
    <>
      {/* Section 2: Workflow Status */}
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
          {/* Summary Row */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                {workflowInstance.workflowCompletedOn ? (
                  <CheckCircleOutlineIcon
                    color="success"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                ) : (
                  <HourglassEmptyIcon
                    color="disabled"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                )}
                <Typography variant="subtitle2" color="text.secondary">
                  {workflowInstance.workflowCompletedOn
                    ? 'Completed'
                    : 'Last Edited'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {workflowInstance.workflowCompletedOn ||
                    workflowInstance.lastEditedOn}
                </Typography>
                {!workflowInstance.workflowCompletedOn && (
                  <Typography variant="caption" color="text.secondary">
                    by {workflowInstance?.lastEditedBy || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <ReplayIcon 
                  color={workflowInstance.workflowCompletedOn ? "success" : "primary"} 
                  sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {progressInfo.completed} / {
                    /* TODO: change implementation to shortest path to completion, not just total steps */
                    workflowInstance.workflowCompletedOn ? progressInfo.completed : workflowInstance.steps.length}
                    {workflowInstance.workflowCompletedOn ? "" : "+"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {/*TODO: change implementation to shortest path to completion, not just total steps */}
                  {workflowInstance.workflowCompletedOn ? "All steps completed": (
                    "At least " + (workflowInstance.steps.length - progressInfo.completed) 
                    + " more step" + (workflowInstance.steps.length - progressInfo.completed !== 1 ? "s" : "") 
                    + " remaining"
                  )}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <CalendarTodayOutlinedIcon
                  color="success"
                  sx={{ fontSize: 32, mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  Started
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {workflowInstance.workflowStartedOn}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  by {workflowInstance.workflowStartedBy}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* "Currently Working On" Section Details */}
          {workflowInstance.steps[progressInfo.currentIndex] && (
            <Box
              sx={{
                // backgroundColor: 'primary.50',
                borderLeft: 4,
                borderLeftColor: 'primary.main',
                p: 2,
                borderRadius: 4,
              }}>
              <Typography
                variant="subtitle2"
                color="primary.main"
                sx={{ mb: 0.5 }}>
                Currently Working On:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {workflowInstance.steps[progressInfo.currentIndex].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatWorkflowStepStatusText(
                  workflowInstance.steps[progressInfo.currentIndex]
                )}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
