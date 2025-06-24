import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { FormTemplate } from 'src/shared/types/form/formTypes';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { useEditFormTemplate } from './mutations';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const editForm = useEditFormTemplate();

  const unarchiveForm = () => {
    if (!template?.id) {
      return;
    }

    editForm.mutate(
      { ...template, archived: false },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template Unarchived!"
        open={editForm.isSuccess}
        onClose={() => editForm.reset()}
      />
      <APIErrorToast open={editForm.isError} onClose={() => editForm.reset()} />

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Unarchive Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to unarchive this form template?</p>
        </DialogContent>
        <DialogActions
          sx={(theme) => ({
            padding: theme.spacing(2),
          })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={unarchiveForm}>Unarchive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnarchiveTemplateDialog;
