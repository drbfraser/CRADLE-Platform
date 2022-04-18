import { CustomizedFormState } from './state';
import { CForm } from 'src/shared/types';

import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

export const handleSubmit = (
  patientId: string,
  setSubmitError: (error: boolean) => void,
  setForm: (form: CForm) => void
) => {
  return async (values: CustomizedFormState, { setSubmitting }: any) => {
    const url =
      API_URL +
      EndpointEnum.FORM_TEMPLATE +
      `/${values.form_template_id}?lang=${values.lang}`;

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
