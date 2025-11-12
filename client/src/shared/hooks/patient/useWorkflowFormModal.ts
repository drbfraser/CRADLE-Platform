import { useState } from 'react';
import { useFormResponseQuery } from 'src/pages/customizedForm/queries';
import { getFormTemplateLangAsync } from 'src/shared/api';
import { FormRenderStateEnum } from 'src/shared/enums';
import {
  FormModalState,
  InstanceStep,
} from 'src/shared/types/workflow/workflowUiTypes';

export function useWorkflowFormModal(
  currentStep: InstanceStep | null,
  reload: () => void
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

        try {
          const formTemplateId = currentStep.formTemplateId;
          const formTemplate = await getFormTemplateLangAsync(
            formTemplateId,
            'English' // TODO: To be updated based on user selected language
          );
          setFormModalState({
            open: true,
            renderState: formRenderState,
            form: formTemplate,
          });
          return;
        } catch {
          console.error('Error in getting form template');
          return;
        }
      }
      case FormRenderStateEnum.VIEW:
      case FormRenderStateEnum.EDIT: {
        if (!currentStep.formId) {
          console.error('No submitted form associated with current step.');
          return;
        }

        const formResponse = formResponseQuery.data;
        if (!formResponse) {
          console.error(`Error in getting form id: ${currentStep.formId}`);
          return;
        }

        setFormModalState({
          open: true,
          renderState: formRenderState,
          form: formResponse,
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
