import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

export interface ConfirmDialogData {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function WorkflowConfirmDialog(props: {
  confirmDialog: ConfirmDialogData;
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogData>>;
}) {
  const { confirmDialog, setConfirmDialog } = props;

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description">
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
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
    </>
  );
}
