import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

type WorkflowInstanceHeaderProps = {
  title: string;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
};

export default function WorkflowInstanceHeader({
  title,
  isLoading,
  error,
  onBack,
  onRetry,
}: WorkflowInstanceHeaderProps) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={onBack} size="medium">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Box sx={{ ml: 0.5 }}>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="h5" component="p">
            Loading workflow instance...
          </Typography>
        </Box>
      )}

      {!isLoading && error && (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={onRetry} sx={{ mr: 2 }}>
            Retry
          </Button>
          <Button variant="outlined" onClick={onBack}>
            Go back
          </Button>
        </Box>
      )}
    </>
  );
}
