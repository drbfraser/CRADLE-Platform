import { Form, InputOnChangeData, Select } from 'semantic-ui-react';
import {
  GestationalAgeUnitEnum, gestationalAgeUnitFormatters, gestationalAgeUnitLabels,
} from 'src/enums';

import { Callback } from 'src/types';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  gestationalAgeUnit: GestationalAgeUnitEnum;
  gestationalTimestamp: number;
  pregnant: boolean;
  updateGestationalAgeUnit: Callback<GestationalAgeUnitEnum>;
}

export const GestationalAge: React.FC<IProps> = ({
  gestationalAgeUnit,
  gestationalTimestamp,
  pregnant,
  updateGestationalAgeUnit,
}) => {
  const classes = useStyles();

  const handleGestationalAgeUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ): void => {
    updateGestationalAgeUnit(value as GestationalAgeUnitEnum);
  };

  const unitOptions = [
    {
      key: GestationalAgeUnitEnum.DAYS,
      text: gestationalAgeUnitLabels[GestationalAgeUnitEnum.DAYS],
      value: GestationalAgeUnitEnum.DAYS,
    },
    {
      key: GestationalAgeUnitEnum.MONTHS,
      text: gestationalAgeUnitLabels[GestationalAgeUnitEnum.MONTHS],
      value: GestationalAgeUnitEnum.MONTHS,
    },
  ];

  return pregnant ? (
    <div className={classes.container}>
      {gestationalTimestamp ? (
        <p>
          <b>Gestational Age: </b>
          {gestationalAgeUnitFormatters[gestationalAgeUnit](gestationalTimestamp)}
        </p>
      ) : null}
      <Form.Field
        name="gestationalUnits"
        control={Select}
        options={unitOptions}
        placeholder={gestationalAgeUnitLabels[gestationalAgeUnit]}
        onChange={handleGestationalAgeUnitChange}
      />
    </div>
  ) : null;
};
