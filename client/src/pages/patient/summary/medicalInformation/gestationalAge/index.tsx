import { Form, InputOnChangeData, Select } from 'semantic-ui-react';
import {
  GestationalAgeUnitEnum,
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/enums';

import React, { useState } from 'react';
import { useStyles } from './styles';
import { Patient } from 'src/types';

interface IProps {
  patient: Patient;
}

export const GestationalAge: React.FC<IProps> = ({ patient }) => {
  const classes = useStyles();
  const [unit, setUnit] = useState(patient.gestationalAgeUnit);
  const isPregnant = patient.isPregnant;
  const timestamp = patient.gestationalTimestamp;

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const handleUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setUnit(value as GestationalAgeUnitEnum);
  };

  return isPregnant ? (
    <div className={classes.container}>
      {timestamp ? (
        <p>
          <b>Gestational Age: </b>
          {gestationalAgeUnitFormatters[unit](timestamp)}
        </p>
      ) : null}
      <Form.Field
        name="gestationalUnits"
        control={Select}
        options={unitOptions}
        placeholder={gestationalAgeUnitLabels[unit]}
        onChange={handleUnitChange}
      />
    </div>
  ) : null;
};
