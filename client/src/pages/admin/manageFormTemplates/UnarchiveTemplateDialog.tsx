import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { FormTemplate } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { handleArchiveFormTemplateAsync } from 'src/shared/api/api';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const unarchiveForm = async () => {
    if (!template?.id) {
      return;
    }

    template.archived = false;

    try {
      await handleArchiveFormTemplateAsync(template);

      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template Unarchived!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
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
