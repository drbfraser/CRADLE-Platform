import { API_URL, apiFetch } from 'src/shared/api';
import { AssessmentField, AssessmentState } from './state';

import { EndpointEnum } from 'src/shared/enums';
import { goBackWithFallback } from 'src/shared/utils';

export const handleSubmit = (
  patientId: string,
  assessmentId: string | undefined,
  referralId: string | undefined,
  drugHistory: string | undefined,
  setSubmitError: (error: boolean) => void
) => {
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
    let method = 'POST';
    if (assessmentId !== undefined) {
      url += EndpointEnum.ASSESSMENTS + '/' + assessmentId;
      method = 'PUT';
    } else {
      url += EndpointEnum.ASSESSMENTS;
    }

    const postBody = JSON.stringify({
      patientId: patientId,
      ...newAssessment,
    });

    try {
      await apiFetch(url, {
        method: method,
        body: postBody,
      });

      const newDrugHistory = values[AssessmentField.drugHistory] 
      
      newDrugHistory === '' ? ' ' : newDrugHistory

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
      
      /*
      if(newDrugHistory === "")
      {
         await apiFetch(
          API_URL +
            EndpointEnum.PATIENTS +
            `/${patientId}` +
            EndpointEnum.MEDICAL_RECORDS,
          {
            method: 'POST',
            body: JSON.stringify({
             [AssessmentField.drugHistory]: " ",
            }),
          }
        );
      }
      else if (drugHistory !== newDrugHistory) {
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
      
*/
      //this case only happens when users click the 'assess referral' button on the
      //referral pending button! this clicking will trigger two request: 1. create a new assessment
      //2.after successfully creating a new assessment, we will send a request to mark the
      //original referral record to be 'assessed'
      if (referralId !== undefined) {
        await apiFetch(
          API_URL + EndpointEnum.REFERRALS + `/assess/${referralId}`,
          {
            method: 'PUT',
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
