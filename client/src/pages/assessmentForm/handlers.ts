import { goBackWithFallback } from 'src/shared/utils';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import { AssessmentState } from './state';
import { apiFetch } from 'src/shared/utils/api';

export const handleSubmit = (
  readingId: string,
  assessmentId: string | undefined,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: AssessmentState, { setSubmitting }: any) => {
    let url = BASE_URL;

    if (assessmentId !== undefined) {
      url += EndpointEnum.ASSESSMENT_UPDATE + '/' + assessmentId;
    } else {
      url += EndpointEnum.ASSESSMENTS;
    }

    const assessmentData = JSON.parse(JSON.stringify(values));
    assessmentData['readingId'] = readingId;

    try {
      const resp = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      });

      if (!resp.ok) {
        throw new Error('Response failed with error code: ' + resp.status);
      }

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
    }

    setSubmitting(false);
  };
};
