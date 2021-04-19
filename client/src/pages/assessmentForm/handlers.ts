import { goBackWithFallback } from 'src/shared/utils';
import { AssessmentState } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  readingId: string,
  assessmentId: string | undefined,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: AssessmentState, { setSubmitting }: any) => {
    let url = API_URL;

    if (assessmentId !== undefined) {
      url += EndpointEnum.ASSESSMENT_UPDATE + '/' + assessmentId;
    } else {
      url += EndpointEnum.ASSESSMENTS;
    }

    const assessmentData = JSON.parse(JSON.stringify(values));
    assessmentData['readingId'] = readingId;

    try {
      await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      });

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
    }

    setSubmitting(false);
  };
};
