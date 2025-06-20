import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { FormTemplate } from 'src/shared/types/types';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { useEditFormTemplate } from './mutations';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const ArchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const editForm = useEditFormTemplate();

  const handleArchiveForm = async () => {
    if (!template?.id) {
      return;
    }

    editForm.mutate(
      { ...template, archived: true },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template Archived!"
        open={editForm.isSuccess}
        onClose={() => editForm.reset()}
      />
      <APIErrorToast open={editForm.isError} onClose={() => editForm.reset()} />

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Archive Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to archive this form template?</p>
        </DialogContent>
        <DialogActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={handleArchiveForm}>Archive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchiveTemplateDialog;
