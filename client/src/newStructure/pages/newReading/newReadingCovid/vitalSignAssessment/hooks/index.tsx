import React from 'react';

export const useNewVitals = () => {
  const [vitals, setVitals] = React.useState({
    dateTimeTaken: null,
    bpSystolic: '',
    bpDiastolic: '',
    heartRateBPM: '',
    bpSystolicError: false,
    bpDiastolicError: false,
    heartRateBPMError: false,
    respiratoryRate: '',
    oxygenSaturation: '',
    temperature: '',
    dateRecheckVitalsNeeded: null,
    isFlaggedForFollowup: false,
  });
  const validate = (name: string, value: number) => {
    if (name === 'bpSystolic') {
      if (value < 50 || value > 300) {
        return true;
      }
    }
    return false;
  };
  const handleChangeVitals = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    const validation = validate(name, value);
    console.log(validation);
    // sys 50-300
    // 30-200 di
    // 30-250 hear
    if (name == 'bpSystolic') {
      setVitals({
        ...vitals,
        [e.target.name]: e.target.value,
        bpSystolicError: validation,
      });
    }
    if (name === 'bpDiastolic') {
      if (value < 30 || value > 200) {
        setVitals({
          ...vitals,
          [e.target.name]: e.target.value,
          bpDiastolicError: true,
        });
      } else {
        setVitals({
          ...vitals,
          [e.target.name]: e.target.value,
        });
      }
    }
    if (name === 'heartRateBPM') {
      if (value < 30 || value > 250) {
        setVitals({
          ...vitals,
          [e.target.name]: e.target.value,
          heartRateBPMError: true,
        });
      } else {
        setVitals({
          ...vitals,
          [e.target.name]: e.target.value,
        });
      }
    } else {
      setVitals({
        ...vitals,
        [e.target.name]: e.target.value,
      });
    }

    console.log(vitals);
  };
  return { vitals, handleChangeVitals };
};
