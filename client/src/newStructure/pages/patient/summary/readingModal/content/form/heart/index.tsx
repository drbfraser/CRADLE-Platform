import { Action, actionCreators } from '../../../../reducers';
import { Form, Input, InputOnChangeData } from 'semantic-ui-react';

import { NewReading } from '@types';
import React from 'react';

interface IProps {
  newReading: NewReading;
  updateState: React.Dispatch<Action>;
}

export const HeartForm: React.FC<Omit<IProps, 'displayReadingModal'>> = ({
  newReading,
  updateState,
}) => {
  const handleReadingChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.updateNewReading({ key: name, value }));
  };

  return (
    <Form.Group widths="equal">
      <Form.Field
        name="bpSystolic"
        value={newReading.bpSystolic}
        control={Input}
        label="Systolic"
        type="number"
        min="10"
        max="300"
        onChange={handleReadingChange}
        required={true}
      />
      <Form.Field
        name="bpDiastolic"
        value={newReading.bpDiastolic}
        control={Input}
        label="Diastolic"
        type="number"
        min="10"
        max="300"
        onChange={handleReadingChange}
        required={true}
      />
      <Form.Field
        name="heartRateBPM"
        value={newReading.heartRateBPM}
        control={Input}
        label="Heart rate"
        type="number"
        min="30"
        max="300"
        onChange={handleReadingChange}
        required={true}
      />
    </Form.Group>
  );
};
