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
    if (e.target.name == 'enabled') {
      setAssessment({
        ...assessment,
        [e.target.name]: e.target.checked,
      });
    } else {
      setAssessment({
        ...assessment,
        [e.target.name]: e.target.value,
      });
    }
  };
  return { assessment, handleChangeAssessment };
};
