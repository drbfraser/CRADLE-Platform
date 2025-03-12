import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { FormTemplate } from 'src/shared/types';
import { handleArchiveFormTemplateAsync } from 'src/shared/api/api';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const unarchiveFormTemplate = useMutation({
    mutationFn: handleArchiveFormTemplateAsync,
  });

  const unarchiveForm = async () => {
    if (!template?.id) {
      return;
    }

    unarchiveFormTemplate.mutate(
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
        open={unarchiveFormTemplate.isSuccess}
        onClose={() => unarchiveFormTemplate.reset()}
      />
      <APIErrorToast
        open={unarchiveFormTemplate.isError}
        onClose={() => unarchiveFormTemplate.reset()}
      />

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
