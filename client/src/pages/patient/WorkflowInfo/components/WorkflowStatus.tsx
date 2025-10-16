import { Box, Typography, Grid, LinearProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Tooltip } from '@mui/material';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
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
            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <ReplayIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Current Step
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {progressInfo.currentIndex + 1} of{' '}
                  {workflowInstance.steps.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {workflowInstance.steps[progressInfo.currentIndex]?.title ||
                    'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    mb: 1,
                  }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                    {progressInfo.percent}%
                  </Box>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {progressInfo.completed} / {progressInfo.total} completed
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
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
                    : 'Estimated Completion'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {workflowInstance.workflowCompletedOn ||
                    (progressInfo.etaDate
                      ? progressInfo.etaDate.toISOString().slice(0, 10)
                      : 'TBD')}
                </Typography>
                {!workflowInstance.workflowCompletedOn && progressInfo.etaDate && (
                  <Typography variant="caption" color="text.secondary">
                    ~{progressInfo.estDaysRemaining} days remaining
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Overall Progress
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={progressInfo.percent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': { borderRadius: 4 },
                }}
              />
              {/* Step markers on progress bar */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}>
                {workflowInstance.steps.map((s, idx) => {
                  const leftPct =
                    workflowInstance.steps.length > 1
                      ? (idx / (workflowInstance.steps.length - 1)) * 100
                      : 0;
                  const isCurrent = idx === progressInfo.currentIndex;
                  const isDone = s.status === StepStatus.COMPLETED;
                  return (
                    <Tooltip
                      key={s.id}
                      title={`${s.title}${
                        isCurrent
                          ? ' (Current)'
                          : isDone
                          ? ' (Completed)'
                          : ' (Pending)'
                      }`}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -5,
                          left: `calc(${leftPct}% - 2px)`,
                          width: isCurrent ? 20 : 16,
                          height: isCurrent ? 20 : 16,
                          borderRadius: '50%',
                          bgcolor: isCurrent
                            ? 'primary.main'
                            : isDone
                            ? 'success.main'
                            : 'grey.400',
                          border: '2px solid #fff',
                          boxShadow: 1,
                          pointerEvents: 'auto',
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          </Box>

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
