import React from 'react';

export const useNewVitals = () => {
  const [vitals, setVitals] = React.useState({
    dateTimeTaken: null,
    bpSystolic: '',
    bpDiastolic: '',
    heartRateBPM: '',
    raspiratoryRate: '',
    oxygenSaturation: '',
    temperature: '',
    dateRecheckVitalsNeeded: null,
    isFlaggedForFollowup: false,
  });
  const handleChangeVitals = (e: any) => {
    setVitals({
      ...vitals,
      [e.target.name]: e.target.value,
    });
  };
  return { vitals, handleChangeVitals };
};
