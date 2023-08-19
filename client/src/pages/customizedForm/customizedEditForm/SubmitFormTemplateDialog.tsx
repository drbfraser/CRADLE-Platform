import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { FormTemplateWithQuestions } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { submitFormTemplateAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  form?: FormTemplateWithQuestions;
}

const SubmitFormTemplateDialog = ({ open, onClose, form }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitForm = async () => {
    if (!form) {
      return;
    }

    try {
      await submitFormTemplateAsync(form);
      setSubmitSuccess(true);
    } catch (e) {
      setSubmitError(true);
    }
    onClose();
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template Saved!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Submit Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to submit this form template?</p>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={submitForm}>Submit</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmitFormTemplateDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
