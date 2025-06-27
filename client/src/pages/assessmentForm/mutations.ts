import { useMutation } from '@tanstack/react-query';
import {
  saveAssessmentAsync,
  saveDrugHistoryAsync,
  saveReferralAssessmentAsync,
} from 'src/shared/api';
import { AssessmentField } from './state';
import { NewAssessment } from 'src/shared/types/assessmentTypes';

const useSaveAssessment = () => {
  return useMutation({
    mutationFn: ({
      patientId,
      assessmentId,
      referralId,
      initialDrugHistory,
      newAssessment,
    }: {
      patientId: string;
      assessmentId: string | undefined;
      referralId: string | undefined;
      initialDrugHistory: string;
      newAssessment: NewAssessment;
    }) => {
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
          const newDrugHistory = newAssessment[AssessmentField.medication];
          if (initialDrugHistory !== newDrugHistory) {
            saveDrugHistoryAsync(newDrugHistory, patientId);
          }
        });
    },
  });
};

export default useSaveAssessment;
