import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { ConfirmDialogData } from 'src/shared/types/confirmDialogTypes';

export type { ConfirmDialogData };

// Kept separate from shared ConfirmDialog: workflow confirmations use
// Cancel/Confirm labels and plain text content, while the shared dialog
// uses Yes/No labels and a warning Alert for content.
export default function WorkflowConfirmDialog(props: {
  confirmDialog: ConfirmDialogData;
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogData>>;
}) {
  const { confirmDialog, setConfirmDialog } = props;

  return (
    <Dialog
      open={confirmDialog.open}
      onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      slotProps={{
        paper: {
          sx: { p: 1.5, borderRadius: 3 },
        },
      }}>
      <DialogTitle id="confirm-dialog-title">{confirmDialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {confirmDialog.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            setConfirmDialog((prev) => ({ ...prev, open: false }))
          }>
          Cancel
        </Button>
        <Button
          onClick={confirmDialog.onConfirm}
          color="primary"
          variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
