import { goBackWithFallback } from '../../../src/shared/utils';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { AssessmentState } from './state';

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

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(assessmentData),
    };

    try {
      const resp = await fetch(url, fetchOptions);

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
