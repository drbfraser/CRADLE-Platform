import { GestationalAgeUnitEnum, SexEnum } from '../../../../../../enums';
import {
  gestationalAgeUnitOptions,
  pregnantOptions,
  sexOptions,
} from './utils';
import {
  gestationalAgeValueMonthOptions,
  gestationalAgeValueWeekOptions,
  getNumOfMonths,
  getNumOfWeeks,
} from '../../../../../../shared/utils';

import { AutocompleteInput } from '../../../../../../shared/components/input/autocomplete';
import { EditedPatient } from '@types';
import React from 'react';
import { TextInput } from '../../../../../../shared/components/input/text';
import { useStyles } from './styles';

export const GESTATIONAL_AGE_UNITS = {
  WEEKS: 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS: 'GESTATIONAL_AGE_UNITS_MONTHS',
};

interface IProps {
  patient: EditedPatient;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PatientInfoForm: React.FC<IProps> = ({ patient, onChange }) => {
  const classes = useStyles();

  const dob = React.useMemo((): string => {
    if (patient.dob) {
      return `${patient.dob}`;
    }

    return ``;
  }, [patient]);

  const patientAge = React.useMemo((): string => {
    return patient.patientAge ? patient.patientAge.toString() : ``;
  }, [patient]);

  const gestationalTimestamp = React.useMemo((): string => {
    return patient.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
      ? getNumOfWeeks(patient.gestationalTimestamp).toString()
      : getNumOfMonths(patient.gestationalTimestamp).toString();
  }, [patient.gestationalAgeUnit, patient.gestationalTimestamp]);

  const handleSelectChange = (
    name: string
  ): ((event: React.ChangeEvent<HTMLInputElement>) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      event.persist();
      onChange({ ...event, target: { ...event.target, name } });
    };
  };

  return (
    <div className={classes.container}>
      <TextInput
        name="patientName"
        value={patient.patientName}
        label="Patient Initials"
        placeholder="Patient Initials"
        onChange={onChange}
        type="text"
        // pattern="[a-zA-Z]*"
        // maxLength="4"
        // minLength="1"
        required={true}
      />
      <div className={classes.row}>
        <TextInput
          name="patientAge"
          value={patientAge}
          label="Age"
          type="number"
          // min="15"
          // max="60"
          placeholder="Patient Age"
          onChange={onChange}
        />
        <TextInput
          name="dob"
          value={dob}
          label="Birthday"
          type="date"
          placeholder="Birthday"
          onChange={onChange}
        />
      </div>
      <AutocompleteInput
        value={patient.patientSex}
        label="Gender"
        options={sexOptions}
        placeholder="Gender"
        // required={true}
        onChange={handleSelectChange(`patientSex`)}
      />
      <AutocompleteInput
        // value={patient.isPregnant}
        label="Pregnant"
        options={pregnantOptions}
        onChange={handleSelectChange(`isPregnant`)}
        disabled={patient.patientSex === SexEnum.MALE}
        // required={patient.patientSex === SexEnum.FEMALE}
      />
      <div className={classes.row}>
        <AutocompleteInput
          value={gestationalTimestamp}
          options={
            patient.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
              ? gestationalAgeValueWeekOptions
              : gestationalAgeValueMonthOptions
          }
          onChange={handleSelectChange(`gestationalTimestamp`)}
          label="Gestational Age"
          disabled={patient.patientSex === SexEnum.MALE || !patient.isPregnant}
          // required={patient.patientSex === SexEnum.FEMALE && patient.isPregnant}
        />
        <AutocompleteInput
          // value={patient.gestationalAgeUnit}
          options={gestationalAgeUnitOptions}
          onChange={handleSelectChange(`gestationalAgeUnit`)}
          label="Gestational Age Unit"
          disabled={patient.patientSex === SexEnum.MALE || !patient.isPregnant}
          // required={patient.patientSex === SexEnum.FEMALE && patient.isPregnant}
        />
      </div>
      <div className={classes.row}>
        <TextInput
          name="zone"
          value={patient.zone}
          label="Zone"
          type="number"
          placeholder="Zone"
          onChange={onChange}
        />
        <TextInput
          name="villageNumber"
          value={patient.villageNumber}
          label="Village"
          type="number"
          placeholder="Village"
          onChange={onChange}
        />
      </div>
      <TextInput
        label="Drug History"
        multiline={true}
        name="drugHistory"
        value={patient.drugHistory}
        placeholder="Enter the patient's drug history..."
        onChange={onChange}
      />
      <TextInput
        label="Medical History"
        multiline={true}
        name="medicalHistory"
        value={patient.medicalHistory}
        placeholder="Enter the patient's medical history..."
        onChange={onChange}
      />
    </div>
  );
};
