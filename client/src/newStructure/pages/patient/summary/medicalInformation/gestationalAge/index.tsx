import { Callback, Patient } from '@types';
import { Form, InputOnChangeData, Select } from 'semantic-ui-react';
import {
  GestationalAgeUnitDisplayEnum,
  GestationalAgeUnitEnum,
} from '../../../../../enums';
import { getNumOfMonths, getNumOfWeeks } from '../../../../../shared/utils';

import React from 'react';
import { unitOptions } from './utils';
import { useStyles } from './styles';

interface IProps {
  gestationalAgeUnit: GestationalAgeUnitEnum;
  gestationalTimestamp: number;
  pregnant: boolean;
  updatePatient: Callback<Callback<Patient, Patient>>;
}

export const GestationalAge: React.FC<IProps> = ({
  gestationalAgeUnit,
  gestationalTimestamp,
  pregnant,
  updatePatient,
}) => {
  const classes = useStyles();

  const handleUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ): void => {
    updatePatient(
      (currentPatient: Patient): Patient => ({
        ...currentPatient,
        gestationalAgeUnit: value as GestationalAgeUnitEnum,
      })
    );
  };

  return pregnant ? (
    <div className={classes.container}>
      <p>
        <b>Gestational Age: </b>
        {gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
          ? `${getNumOfWeeks(gestationalTimestamp)} week(s)`
          : `${getNumOfMonths(gestationalTimestamp)} month(s)`}
      </p>
      <Form.Field
        name="gestationalUnits"
        control={Select}
        options={unitOptions}
        placeholder={
          gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
            ? GestationalAgeUnitDisplayEnum.WEEKS
            : GestationalAgeUnitDisplayEnum.MONTHS
        }
        onChange={handleUnitChange}
      />
    </div>
  ) : null;
};
