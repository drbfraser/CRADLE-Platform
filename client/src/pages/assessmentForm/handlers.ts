import { goBackWithFallback } from 'src/shared/utils';
import { AssessmentField, AssessmentState } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  patientId: string,
  assessmentId: string | undefined,
  referralId: string | undefined,
  drugHistory: string,
  setSubmitError: (error: boolean) => void
) => {
  // console.log(referralId);
  // console.log(assessmentId);
  // console.log("*****************");
  return async (values: AssessmentState, { setSubmitting }: any) => {
    const newAssessment = {
      [AssessmentField.investigation]: values[AssessmentField.investigation],
      [AssessmentField.finalDiagnosis]: values[AssessmentField.finalDiagnosis],
      [AssessmentField.treatment]: values[AssessmentField.treatment],
      [AssessmentField.medication]: values[AssessmentField.drugHistory],
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
      patientId: patientId,
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

      //this case only happens when users click the 'assess referral' button on the
      //referral pending button! this clicking will trigger two request: 1. create a new assessment
      //2.after successfully creating a new assessment, we will send a request to mark the
      //original referral record to be 'assessed'
      if (referralId !== undefined) {
        // console.log(referralId);
        await apiFetch(
          API_URL + EndpointEnum.REFERRALS + `/assess/${referralId}`,
          {
            method: 'PUT',
            // body: JSON.stringify({
            //   ['referral_id']: referralId,
            // }),
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
