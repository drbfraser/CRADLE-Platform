import { FollowUp, OrNull } from '@types';

import React from 'react';

export const useNewAssessment = () => {
  const [assessment, setAssessment] = React.useState({
    specialInvestigations: '',
    finalDiagnosis: '',
    treatmentOP: '',
    medPrescribed: '',
    InstructionFollow: '',
    enabled: false,
  });

  const handleChangeAssessment = (e: any) => {
    if (e.target.name === `enabled`) {
      setAssessment({
        ...assessment,
        InstructionFollow: e.target.checked ? assessment.InstructionFollow : ``,
        [e.target.name]: e.target.checked,
      });
    } else {
      setAssessment({
        ...assessment,
        [e.target.name]: e.target.value,
      });
    }
  };

  const resetValueAssessment = (reset: boolean) => {
    if (reset) {
      setAssessment({
        specialInvestigations: '',
        finalDiagnosis: '',
        treatmentOP: '',
        medPrescribed: '',
        InstructionFollow: '',
        enabled: false,
      });
    }
  };

  const initializeAssessment = (assessment: OrNull<FollowUp>): void => {
    if (assessment) {
      setAssessment({
        specialInvestigations: assessment.specialInvestigations,
        finalDiagnosis: assessment.diagnosis,
        treatmentOP: assessment.treatment,
        medPrescribed: assessment.medicationPrescribed,
        InstructionFollow: assessment.followupInstructions ?? ``,
        enabled: assessment.followupNeeded,
      });
    }
  };

  return {
    assessment,
    handleChangeAssessment,
    initializeAssessment,
    resetValueAssessment,
  };
};
