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
import { saveFormTemplateAsync } from 'src/shared/api/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IProps {
  open: boolean;
  onClose: () => void;
  form?: FormTemplateWithQuestions;
}

const SubmitFormTemplateDialog = ({
  open,
  onClose,
  form: formTemplate,
}: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const submitForm = async () => {
    if (!formTemplate) {
      return;
    }

    try {
      await saveFormTemplateAsync(formTemplate);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/admin/form-templates`);
      }, 1000);
    } catch (e) {
      console.error(e);
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
        <DialogActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={submitForm}>Submit</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmitFormTemplateDialog;
