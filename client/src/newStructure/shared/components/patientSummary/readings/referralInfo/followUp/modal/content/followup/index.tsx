import React from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
} from 'semantic-ui-react';
import { followupFrequencyUnitOptions } from '../../../utils';
import { untilDateOrOther } from '../utils';
import { IState } from '../..';

interface IProps {
  dateOrOther: any;
  followupNeeded: boolean;
  followupInstructions: any
  followupFrequencyValue: any
  followupFrequencyUnit: any
  setState: React.Dispatch<React.SetStateAction<IState>>;
  handleChange: any;
}

export const FollowupForm: React.FC<IProps> = ({ 
  dateOrOther,
  followupInstructions,
  followupFrequencyUnit,
  followupFrequencyValue,
  followupNeeded, 
  setState,
  handleChange, 
}) => {
  const handleDateOrOtherChange = (_: any, value: any): void => {
    if (
      value.name === `untilDateOrOther` &&
      (value.value === `OTHER` || value.value === `DATE`)
    ) {
      setState((currentState: IState): IState => ({
        ...currentState,
        dateOrOther: value.value
      }));
    }
  };

  return followupNeeded ? (
    <Form>
      <Form.Field
        name="followupInstructions"
        value={ followupInstructions || `` }
        control={ TextArea }
        label="Instructions for Follow up"
        placeholder="Instruction for VHT to help patient to remedy their chief complaint"
        onChange={ handleChange }></Form.Field>
      <Form.Group widths="equal">
        <Form.Field
          name="followupFrequencyValue"
          value={ followupFrequencyValue || `` }
          control={ Input }
          type="number"
          min="1"
          label="Frequency"
          placeholder="Number"
          onChange={ handleChange }></Form.Field>
        <Form.Field
          name="followupFrequencyUnit"
          value={ followupFrequencyUnit || `N/A` }
          control={ Select }
          options={ followupFrequencyUnitOptions }
          label="Frequency Unit"
          onChange={ handleChange }></Form.Field>
      </Form.Group>
      <Form.Group>
        <Form.Field
          name="untilDateOrOther"
          value={ dateOrOther }
          control={ Select }
          options={ untilDateOrOther }
          label="Until:"
          onChange={ handleDateOrOtherChange }></Form.Field>
        <Form.Field
          name="dateFollowupNeededTill"
          control={ Input }
          type="date"
          label="Until Date"
          disabled={ dateOrOther === `OTHER` }
          onChange={ handleChange }></Form.Field>
        <Form.Field
          name="dateFollowupNeededTill"
          control={ TextArea }
          label="Other"
          disabled={ dateOrOther === `DATE` }
          onChange={ handleChange }></Form.Field>
      </Form.Group>
    </Form>
  ) : null;
};
