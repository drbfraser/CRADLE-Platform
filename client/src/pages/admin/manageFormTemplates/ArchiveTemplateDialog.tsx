import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { FormTemplate } from 'src/shared/types';
import React from 'react';
import { Toast } from 'src/shared/components/toast';
import { archiveFormTemplateAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const ArchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const archiveForm = async () => {
    if (!template?.id) {
      return;
    }

    template.archived = true;

    try {
      await archiveFormTemplateAsync(template);

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
        <DialogActions className={classes.actions}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={archiveForm}>Archive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchiveTemplateDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
