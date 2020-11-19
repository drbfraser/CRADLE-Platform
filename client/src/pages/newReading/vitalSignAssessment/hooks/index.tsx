import React from 'react';

export const useNewVitals = () => {
  const [vitals, setVitals] = React.useState({
    dateTimeTaken: null,
    bpSystolic: null,
    bpDiastolic: null,
    heartRateBPM: null,
    bpSystolicError: false,
    bpDiastolicError: false,
    heartRateBPMError: false,
    oxygenSaturationError: false,
    respiratoryRateError: false,
    respiratoryRate: null,
    oxygenSaturation: null,
    temperature: null,
    temperatureError: false,
    dateRecheckVitalsNeeded: null,
    isFlaggedForFollowup: false,
  });

  const resetValueVitals = (reset: boolean) => {
    if (reset) {
      setVitals({
        dateTimeTaken: null,
        bpSystolic: null,
        bpDiastolic: null,
        heartRateBPM: null,
        bpSystolicError: false,
        bpDiastolicError: false,
        heartRateBPMError: false,
        oxygenSaturationError: false,
        respiratoryRateError: false,
        respiratoryRate: null,
        oxygenSaturation: null,
        temperature: null,
        temperatureError: false,
        dateRecheckVitalsNeeded: null,
        isFlaggedForFollowup: false,
      });
    }
  };

  const validate = (name: string, value: number) => {
    if (name === 'bpSystolic') {
      if (value < 50 || value > 300 || !Number.isInteger(+value)) {
        return true;
      }
    }
    if (name === 'bpDiastolic') {
      if (value < 30 || value > 200 || !Number.isInteger(+value)) {
        return true;
      }
    }
    if (name === 'heartRateBPM') {
      if (value < 30 || value > 250 || !Number.isInteger(+value)) {
        return true;
      }
    }
    if (name === 'respiratoryRate') {
      if (value > 100 || value < 1  || !Number.isInteger(+value)) {
        return true;
      }
    }
    if (name === 'oxygenSaturation') {
      if (value < 50 || value > 100 || !Number.isInteger(+value)) {
        return true;
      }
    }
    if (name === 'temperature') {
      if (value < 30 || value > 45 || !Number.isInteger(+value)) {
        return true;
      }
    }
    return false;
  };

  const handleChangeVitals = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    const validation = validate(name, value);

    if (name === `bpSystolic`) {
      setVitals({
        ...vitals,
        [name]: value,
        bpSystolicError: validation,
      });
    }
    if (name === 'bpDiastolic') {
      setVitals({
        ...vitals,
        [name]: value,
        bpDiastolicError: validation,
      });
    }
    if (name === 'heartRateBPM') {
      setVitals({
        ...vitals,
        [name]: value,
        heartRateBPMError: validation,
      });
    }
    if (name === 'respiratoryRate') {
      setVitals({
        ...vitals,
        [name]: value,
        respiratoryRateError: validation,
      });
    }
    if (name === 'oxygenSaturation') {
      setVitals({
        ...vitals,
        [name]: value,
        oxygenSaturationError: validation,
      });
    }
    if (name === 'temperature') {
      setVitals({
        ...vitals,
        [name]: value,
        temperatureError: validation,
      });
    }
  };
  return { vitals, handleChangeVitals, resetValueVitals };
};
