import { CForm, FormTemplate } from 'src/shared/types';

import { CustomizedFormState } from './state';
import { getFormTemplateLangAsync } from 'src/shared/api';

export const handleSubmit = async (
  formTemplates: FormTemplate[],
  setSubmitError: (error: boolean) => void,
  setForm: (form: CForm) => void,
  customizedFormState: CustomizedFormState,
  setSubmitting: (submitting: boolean) => void
) => {
  const formNameIdMap = new Map<string, string>(
    formTemplates.map((item) => [item.classification.name, item.id])
  );

  const formTemplateId: string =
    customizedFormState.name !== null
      ? formNameIdMap.get(customizedFormState.name) ?? ''
      : '';

  try {
    setForm(
      await getFormTemplateLangAsync(
        formTemplateId,
        customizedFormState.lang ?? ''
      )
    );
  } catch (e) {
    console.error(e);
    setSubmitError(true);
    setSubmitting(false);
  }
};
