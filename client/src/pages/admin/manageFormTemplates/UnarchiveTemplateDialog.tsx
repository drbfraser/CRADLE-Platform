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
import { unarchiveFormTemplateAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplate;
}

const UnarchiveTemplateDialog = ({ open, onClose, template }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const unarchiveForm = async () => {
    if (!template?.id) {
      return;
    }

    template.archived = false;

    try {
      await unarchiveFormTemplateAsync(template);

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
        <DialogActions className={classes.actions}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={unarchiveForm}>Unarchive</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnarchiveTemplateDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
