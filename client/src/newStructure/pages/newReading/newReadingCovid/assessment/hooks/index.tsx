import React from 'react';

export const useNewAssessment = () => {
  const [assessment, setAssessment] = React.useState({
    specialInvestigations: '',
    finalDiagnosis: '',
    treatmentOP: '',
    medPrescribed: '',
    frequency: '',
    frequencyUnit: '',
    until: '',
    untilDate: '',
    other: '',
  });
  const handleChangeAssessment = (e: any) => {
    setAssessment({
      ...assessment,
      [e.target.name]: e.target.value,
    });
  };
  return { assessment, handleChangeAssessment };
};
