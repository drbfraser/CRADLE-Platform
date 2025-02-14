import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { RelayNum } from 'src/shared/types';
import { deleteRelayNumAsync } from 'src/shared/api/api';
import { Toast } from 'src/shared/components/toast';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';

interface IProps {
  open: boolean;
  onClose: () => void;
  relayNumToDelete?: RelayNum;
}

const DeleteRelayNumDialog = ({ open, onClose, relayNumToDelete }: IProps) => {
  const deleteRelayNum = useMutation({
    mutationFn: deleteRelayNumAsync,
  });

  const handleDelete = async () => {
    if (!relayNumToDelete) {
      return;
    }

    deleteRelayNum.mutate(relayNumToDelete, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Number Successfully Deleted!"
        open={deleteRelayNum.isSuccess}
        onClose={() => deleteRelayNum.reset()}
      />
      {deleteRelayNum.isError && <APIErrorToast />}

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Relay Number</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this form template?</p>
        </DialogContent>
        <DialogActions
          sx={(theme) => ({
            padding: theme.spacing(2),
          })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={handleDelete}>Delete</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteRelayNumDialog;
