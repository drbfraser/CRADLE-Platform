import { Alert, Typography, Button, Box, Slide } from '@mui/material';

interface IProps {
  open: boolean;
  handleClose: () => void;
}

export default function RecommendationBanner({ open, handleClose }: IProps) {
  return (
    <Slide in={open} direction="up">
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
              Recommended next step: Continue to Intake Details.
            </Typography>

            <Button
              variant="outlined"
              size="small"
              sx={{
                whiteSpace: 'nowrap',
                mb: 1,
              }}>
              Go to Step
            </Button>
          </Box>
        </Alert>
      </Box>
    </Slide>
  );
}
