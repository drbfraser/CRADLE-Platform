import { useMutation } from '@tanstack/react-query';
import {
  saveAssessmentAsync,
  saveDrugHistoryAsync,
  saveReferralAssessmentAsync,
} from 'src/shared/api/api';
import { AssessmentField, AssessmentState } from './state';
import { NewAssessment } from 'src/shared/types';

const useSaveAssessment = () => {
  return useMutation({
    mutationFn: ({
      patientId,
      assessmentId,
      referralId,
      initialDrugHistory,
      formValues,
    }: {
      patientId: string;
      assessmentId: string | undefined;
      referralId: string | undefined;
      initialDrugHistory: string;
      formValues: AssessmentState;
    }) => {
      const newAssessment: NewAssessment = {
        [AssessmentField.investigation]:
          formValues[AssessmentField.investigation],
        [AssessmentField.finalDiagnosis]:
          formValues[AssessmentField.finalDiagnosis],
        [AssessmentField.treatment]: formValues[AssessmentField.treatment],
        [AssessmentField.medication]: formValues[AssessmentField.drugHistory],
        [AssessmentField.followUp]: formValues[AssessmentField.followUp],
        [AssessmentField.followUpInstructions]:
          formValues[AssessmentField.followUpInstructions],
      };

      return saveAssessmentAsync(newAssessment, assessmentId, patientId)
        .then(() => {
          // this case only happens when users click the 'assess referral' button on the
          // referral pending button! this clicking will trigger two request:
          //   1. create a new assessment
          //   2. after successfully creating a new assessment, we will send a request to mark the
          //      original referral record to be 'assessed'
          if (referralId) {
            saveReferralAssessmentAsync(referralId);
          }
        })
        .then(() => {
          const newDrugHistory = formValues[AssessmentField.drugHistory];
          if (initialDrugHistory !== newDrugHistory) {
            saveDrugHistoryAsync(newDrugHistory, patientId);
          }
        });
    },
  });
};

export default useSaveAssessment;
