import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { FormTemplateWithQuestions } from 'src/shared/types/types';
import { saveFormTemplateAsync } from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

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
  const navigate = useNavigate();

  const saveFormTemplate = useMutation({
    mutationFn: saveFormTemplateAsync,
  });

  const handleSubmit = () => {
    if (!formTemplate) {
      return;
    }
    saveFormTemplate.mutate(formTemplate, {
      onSuccess: () => {
        navigate('/admin/form-templates');
      },
    });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Form Template Saved!"
        open={saveFormTemplate.isSuccess}
        onClose={() => saveFormTemplate.reset()}
      />
      <APIErrorToast
        open={saveFormTemplate.isError}
        onClose={() => saveFormTemplate.reset()}
      />

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Submit Form Template</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to submit this form template?</p>
        </DialogContent>
        <DialogActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmitFormTemplateDialog;
