import { AssessmentField, AssessmentState } from './state';
import {
  saveAssessmentAsync,
  saveDrugHistoryAsync,
  saveReferralAssessmentAsync,
} from 'src/shared/api';

import { goBackWithFallback } from 'src/shared/utils';

export const handleSubmit = (
  patientId: string,
  assessmentId: string | undefined,
  referralId: string | undefined,
  drugHistory: string,
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

    try {
      await saveAssessmentAsync(newAssessment, assessmentId, patientId);

      const newDrugHistory = values[AssessmentField.drugHistory];

      drugHistory !== newDrugHistory &&
        (await saveDrugHistoryAsync(newDrugHistory, patientId));

      //this case only happens when users click the 'assess referral' button on the
      //referral pending button! this clicking will trigger two request: 1. create a new assessment
      //2.after successfully creating a new assessment, we will send a request to mark the
      //original referral record to be 'assessed'
      referralId !== undefined && (await saveReferralAssessmentAsync(referralId));

      goBackWithFallback('/patients');
    } catch (e) {
      setSubmitError(true);
      setSubmitting(false);
    }
  };
};
