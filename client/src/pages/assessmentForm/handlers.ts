import { goBackWithFallback } from 'src/shared/utils';
import { AssessmentField, AssessmentState } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  patientId: string,
  readingId: string,
  assessmentId: string | undefined,
  drugHistory: string,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: AssessmentState, { setSubmitting }: any) => {
    const newAssessment = {
      [AssessmentField.investigation]: values[AssessmentField.investigation],
      [AssessmentField.finalDiagnosis]: values[AssessmentField.finalDiagnosis],
      [AssessmentField.treatment]: values[AssessmentField.treatment],
      [AssessmentField.followUp]: values[AssessmentField.followUp],
      [AssessmentField.followUpInstruc]:
        values[AssessmentField.followUpInstruc],
    };

    let url = API_URL;
    if (assessmentId !== undefined) {
      url += EndpointEnum.ASSESSMENT_UPDATE + '/' + assessmentId;
    } else {
      url += EndpointEnum.ASSESSMENTS;
    }

    const postBody = JSON.stringify({
      readingId: readingId,
      ...newAssessment,
    });

    try {
      await apiFetch(url, {
        method: 'POST',
        body: postBody,
      });

      const newDrugHistory = values[AssessmentField.drugHistory];
      if (drugHistory !== newDrugHistory) {
        await apiFetch(
          API_URL +
            EndpointEnum.PATIENTS +
            `/${patientId}` +
            EndpointEnum.MEDICAL_RECORDS,
          {
            method: 'POST',
            body: JSON.stringify({
              [AssessmentField.drugHistory]: newDrugHistory,
            }),
          }
        );
      }

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };
};
