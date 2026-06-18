import { Alert, Snackbar } from '@mui/material';
import { SnackbarState } from 'src/shared/hooks/useSnackbar';

type WorkflowInstanceSnackbarProps = {
  snackbar: SnackbarState;
  onClose: () => void;
};

export default function WorkflowInstanceSnackbar({
  snackbar,
  onClose,
}: WorkflowInstanceSnackbarProps) {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        mb: '80px',
        borderRadius: 2,
      }}>
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
