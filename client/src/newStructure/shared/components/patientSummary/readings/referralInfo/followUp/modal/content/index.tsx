/**
 * Description: Modal reponsible for the the UI to create and update
 *      the Follow Up info for Referrals
 * Props:
 *  initialValues [JSON]: initial values of to insert into the form
 *  handleSubmit(state) [required]: function that is called when the user submits form
 *      this function should handle data validation
 */

import {
  Button,
  Form,
  Modal,
  TextArea,
} from 'semantic-ui-react';

import React from 'react';
import Switch from '@material-ui/core/Switch';
import { IState } from '..';
import { FollowupForm } from './followup';

interface IProps {
  data: any;
  dateOrOther: any;
  initialValues: { [key: string]: string },
  referralId: string,
  untilDateOrCond: any;
  createFollowUp: any,
  setState: React.Dispatch<React.SetStateAction<IState>>;
  updateFollowUp: any,
}

export const Content: React.FC<IProps> = ({
  data, 
  dateOrOther,
  initialValues, 
  referralId, 
  untilDateOrCond,
  createFollowUp,
  setState, 
  updateFollowUp,
}) => {
  const handleClose = (): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      isOpen: false,
    }));

  const handleChange = (_: any, value: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      data: {
        ...data,
        [value.name]: value.value,
      },
    }));

  const handleSwitchChange = (e: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      data: {
        ...data,
        followupNeeded: e.target.checked,
      },
    }));

  const handleSubmit = (): void => {
    data.referral = referralId;

    if (dateOrOther === `DATE`) {
      data.dateFollowupNeededTill =
        Date.parse(data.dateFollowupNeededTill) / 1000; // divide by 1000 to convert ms into s
    }

    if (untilDateOrCond) {
      setState((currentState: IState): IState => ({
        ...currentState,
        untilDateOrCond: undefined
      }));
    }

    // update existing followUpInfo
    if (initialValues) {
      updateFollowUp(
        initialValues.id,
        data
      );
    } else {
      // create new followUpInfo
      const followupData = data;
      // TODO: remove this once mobile is up to date with the new assessment changes
      // followupData.followUpAction = followupData.specialInvestigations;

      if (!followupData.followupNeeded) {
        delete followupData.dateFollowupNeededTill;
      }
      createFollowUp(data);
    }

    handleClose();
  };

  return (
    <Modal.Content scrolling={true}>
      <Modal.Description>
        <Form onSubmit={ handleSubmit }>
          <Form.Field
            name="specialInvestigations"
            value={ data.specialInvestigations || `` }
            control={ TextArea }
            label="Special Investigations + Results (If available)"
            placeholder="Patient's action performed for this follow up"
            onChange={ handleChange }
            required
          />
          <Form.Field
            name="diagnosis"
            value={ data.diagnosis || `` }
            control={ TextArea }
            label="Final Diagnosis"
            placeholder="Medical diagnosis of the cause of their chief complaint"
            onChange={ handleChange }
            required
          />
          <Form.Field
            name="treatment"
            value={ data.treatment || `` }
            control={ TextArea }
            label="Treatment/Operation"
            placeholder="Treatment performed on patient to remedy their chief complaint"
            onChange={ handleChange }
            required
          />
          <Form.Field
            name="medicationPrescribed"
            value={ data.medicationPrescribed || `` }
            control={ TextArea }
            label="Medication Prescribed"
            placeholder="Medication prescribed to patient to remedy their chief complaint"
            onChange={ handleChange }
            required
          />
          <Form.Field style={ { margin: `0px` } }>
            <label
              style={ {
                display: `inline-block`,
                marginRight: `5px`,
              } }>
              Follow-up Needed
              </label>
            <Switch
              className="followupNeeded"
              checked={ data.followupNeeded }
              onChange={ handleSwitchChange }
              color="primary"
            />
          </Form.Field>
          <FollowupForm
            dateOrOther={ dateOrOther }
            followupNeeded={ data.followupNeeded }
            followupInstructions={ data.followupInstructions }
            followupFrequencyValue={ data.followupFrequencyValue }
            followupFrequencyUnit={ data.followupFrequencyUnit }
            handleChange={ handleChange }
            setState={ setState }
          />
          <Form.Field control={ Button } style={ { marginTop: `10px` } }>
            Submit
          </Form.Field>
        </Form>
      </Modal.Description>
    </Modal.Content>
  );
};
