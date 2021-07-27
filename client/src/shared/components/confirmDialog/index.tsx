import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Alert from '@material-ui/lab/Alert';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

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
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">{content}</Alert>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} color="primary">
          No
        </Button>
        <Button variant="contained" onClick={onConfirm} color="default">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
