import { CancelButton, PrimaryButton } from '../Button';

import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface IProps {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  title,
  content,
  open,
  onClose,
  onConfirm,
}: IProps) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog">
      <DialogTitle id="confirm-dialog" data-testid="confirm-dialog">
        {title}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" data-testid="warningAlert">
          {content}
        </Alert>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClose}>No</CancelButton>
        <PrimaryButton onClick={onConfirm}>Yes</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
