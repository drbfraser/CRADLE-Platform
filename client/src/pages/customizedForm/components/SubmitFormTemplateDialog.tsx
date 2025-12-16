import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { saveFormTemplateAsyncV2 } from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  form?: FormTemplateWithQuestionsV2;
}

interface FormTemplatePayload {
  id?: string | undefined;
  classification: {
    id?: string;
    name: Record<string, string>;
    nameStringId?: string;
  };
  version: number;
  questions: TQuestion[];
}

export function buildFormTemplatePayload(
  form: FormTemplateWithQuestionsV2
): FormTemplatePayload {
  return {
    id: form.id,
    classification: { ...form.classification },
    version: form.version,
    questions: form.questions.map((q, i) => ({
      id: q.id,
      questionType: q.questionType,
      required: q.required,
      allowPastDates: q.allowPastDates,
      allowFutureDates: q.allowFutureDates,
      categoryIndex: q.categoryIndex,
      units: q.units,
      numMin: q.numMin,
      numMax: q.numMax,
      stringMaxLength: q.stringMaxLength,
      stringMaxLines: q.stringMaxLines,
      visibleCondition: q.visibleCondition || [],
      questionText: q.questionText || {},
      mcOptions: q.mcOptions || [],
      isBlank: true,
      order: q.order,
      hasCommentAttached: q.hasCommentAttached,
      questionStringId: q.questionStringId,
      userQuestionId: q.userQuestionId,
      formTemplateId: form.id,
    })),
  };
}

const SubmitFormTemplateDialog = ({
  open,
  onClose,
  form: formTemplate,
}: IProps) => {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');

  const saveFormTemplate = useMutation({
    mutationFn: saveFormTemplateAsyncV2,
  });

  const handleSubmit = () => {
    if (!formTemplate) {
      return;
    }
    const payload = buildFormTemplatePayload(formTemplate);

    saveFormTemplate.mutate(payload, {
      onSuccess: () => {
        navigate('/admin/form-templates');
      },
      onError: (err: any) => {
        if (err.status === 409) {
          setErrorMessage(err.message);
        }
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
        errorMessage={errorMessage}
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
