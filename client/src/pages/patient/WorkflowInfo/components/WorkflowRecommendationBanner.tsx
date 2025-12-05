import { Alert, Typography, Button, Box, Slide } from '@mui/material';
import { WorkflowInstanceAction } from 'src/shared/types/workflow/workflowApiTypes';

export interface RecommendationBannerData {
  open: boolean;
  hasNextStep?: boolean;
  message: string;
}

interface IProps {
  recommendation: RecommendationBannerData;
  handleClose: () => void;
  handleGoToStep: () => void;
  handleOpen: (newActions: WorkflowInstanceAction[]) => void;
}

export default function RecommendationBanner({
  recommendation,
  handleClose,
  handleGoToStep,
  handleOpen,
}: IProps) {
  return (
    <Slide in={recommendation.open} direction="up">
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 200,
          right: 100,
          zIndex: 1300,
          px: 2,
          pb: 2,
        }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
            px: 2,
            pt: 1.5,
            pb: 0,
          }}
          onClose={handleClose}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <Typography
              sx={{
                fontSize: 15,
                pb: 2,
              }}>
              {`Recommended next step: ${recommendation.message}`}
            </Typography>

            {recommendation.hasNextStep && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleGoToStep}
                sx={{
                  whiteSpace: 'nowrap',
                  mb: 1,
                }}>
                Go to Step
              </Button>
            )}
          </Box>
        </Alert>
      </Box>
    </Slide>
  );
}
