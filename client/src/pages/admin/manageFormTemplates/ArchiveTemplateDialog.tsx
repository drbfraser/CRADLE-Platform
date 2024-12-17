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

const ArchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const archiveForm = async () => {
    if (!template?.id) {
      return;
    }

    template.archived = true;

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
        message="Form Template Archived!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Archive Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to archive this form template?</p>
        </DialogContent>
        <DialogActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={archiveForm}>Archive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchiveTemplateDialog;
