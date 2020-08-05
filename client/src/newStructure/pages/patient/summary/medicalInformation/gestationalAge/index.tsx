import { Form, InputOnChangeData, Select } from 'semantic-ui-react';
import {
  GestationalAgeUnitDisplayEnum,
  GestationalAgeUnitEnum,
} from '../../../../../enums';
import { getNumOfMonths, getNumOfWeeks } from '../../../../../shared/utils';

import { Callback } from '@types';
import React from 'react';
import { unitOptions } from './utils';
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
        onChange={handleGestationalAgeUnitChange}
      />
    </div>
  ) : null;
};
