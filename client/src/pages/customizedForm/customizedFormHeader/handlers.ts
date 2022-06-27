import { API_URL, apiFetch } from 'src/shared/api';
import { CForm, FormTemplate } from 'src/shared/types';

import { CustomizedFormState } from './state';
import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  patientId: string,
  formSchemas: FormTemplate[],
  setSubmitError: (error: boolean) => void,
  setForm: (form: CForm) => void
) => {
  return async (values: CustomizedFormState, { setSubmitting }: any) => {
    const form_name_id_map = new Map<string, string>();
    formSchemas.map((item) =>
      form_name_id_map.set(item.classification.name, item.id)
    );
    const form_template_id =
      values.name != null ? form_name_id_map.get(values.name) : '';
    const url =
      API_URL +
      EndpointEnum.FORM_TEMPLATE +
      `/${form_template_id}?lang=${values.lang}`;
    try {
      await apiFetch(url)
        .then((resp) => resp.json())
        .then((fm: CForm) => {
          setForm(fm);
        });
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };
};
