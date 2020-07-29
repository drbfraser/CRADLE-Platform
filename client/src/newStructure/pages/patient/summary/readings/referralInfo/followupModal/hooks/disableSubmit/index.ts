import { NewAssessment } from '@types';
import React from 'react';

interface IArgs {
  loading: boolean;
  newAssessment: NewAssessment;
}

export const useDisableSubmit = ({
  loading,
  newAssessment,
}: IArgs): boolean => {
  return React.useMemo((): boolean => {
    return (
      loading ||
      !newAssessment.specialInvestigations ||
      !newAssessment.diagnosis ||
      !newAssessment.treatment ||
      !newAssessment.medicationPrescribed ||
      (newAssessment.followupNeeded && !newAssessment.followupInstructions)
    );
  }, [loading, newAssessment]);
};
