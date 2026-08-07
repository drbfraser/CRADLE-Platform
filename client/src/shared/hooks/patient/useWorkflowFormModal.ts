import { useState } from 'react';
import { useFormResponseQuery } from 'src/pages/customizedForm/queries';
import { getFormTemplateLangAsyncV2 } from 'src/shared/api';
import { FormRenderStateEnum, SnackbarSeverity } from 'src/shared/enums';
import {
  FormModalState,
  InstanceStep,
} from 'src/shared/types/workflow/workflowUiTypes';

export function useWorkflowFormModal(
  currentStep: InstanceStep | null,
  reload: () => void,
  lang: string = 'English',
  showSnackbar?: (message: string, severity: SnackbarSeverity) => void
) {
  const [formModalState, setFormModalState] = useState<FormModalState>({
    open: false,
    renderState: FormRenderStateEnum.FIRST_SUBMIT,
    form: null,
  });
  const formResponseQuery = useFormResponseQuery(currentStep?.formId || '');

  const onRefetchForm = () => {
    formResponseQuery.refetch();
  };

  const handleOpenFormModal = async (formRenderState: FormRenderStateEnum) => {
    if (!currentStep) {
      console.error('No current step available to open form.');
      return;
    }

    switch (formRenderState) {
      case FormRenderStateEnum.FIRST_SUBMIT: {
        if (!currentStep.formTemplateId) {
          console.error('No form associated with current step.');
          return;
        }

        const formTemplateId = currentStep.formTemplateId;
        const isEnglish = lang.trim().toLowerCase() === 'english';

        try {
          const formTemplate = await getFormTemplateLangAsyncV2(
            formTemplateId,
            lang
          );
          setFormModalState({
            open: true,
            renderState: formRenderState,
            form: formTemplate,
          });
          return;
        } catch {
          if (isEnglish) {
            console.error('Error in getting form template');
            showSnackbar?.(
              'Unable to load this form. Please try again.',
              SnackbarSeverity.ERROR
            );
            return;
          }
        }

        // The form attached to this step isn't translated into the
        // instance's language - fall back to English rather than leaving
        // the "Complete Form" action looking broken.
        try {
          const formTemplate = await getFormTemplateLangAsyncV2(
            formTemplateId,
            'English'
          );
          setFormModalState({
            open: true,
            renderState: formRenderState,
            form: formTemplate,
          });
          showSnackbar?.(
            `This form isn't available in ${lang} yet - showing it in English instead.`,
            SnackbarSeverity.WARNING
          );
          return;
        } catch {
          console.error('Error in getting form template');
          showSnackbar?.(
            'Unable to load this form. Please try again.',
            SnackbarSeverity.ERROR
          );
          return;
        }
      }
      case FormRenderStateEnum.VIEW:
      case FormRenderStateEnum.EDIT: {
        if (!currentStep.formId) {
          console.error('No submitted form associated with current step.');
          return;
        }

        const formResponse = await formResponseQuery.refetch();
        const formData = formResponse.data;
        if (!formData) {
          console.error(`Error in getting form id: ${currentStep.formId}`);
          return;
        }

        setFormModalState({
          open: true,
          renderState: formRenderState,
          form: formData,
        });

        return;
      }
      default:
        console.error('Invalid form modal render state');
        return;
    }
  };

  const handleCloseFormModal = () => {
    console.log('Closing Form Modal');
    setFormModalState({
      open: false,
      renderState: FormRenderStateEnum.FIRST_SUBMIT,
      form: null,
    });
    reload();
  };

  return {
    formModalState,
    handleOpenFormModal,
    handleCloseFormModal,
    onRefetchForm,
  };
}
