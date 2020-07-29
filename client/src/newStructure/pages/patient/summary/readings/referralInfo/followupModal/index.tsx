import { Action, actionCreators } from '../../../reducers';
import { Form, InputOnChangeData, Modal, TextArea } from 'semantic-ui-react';
import { NewAssessment, OrNull, Referral } from '@types';
import {
  clearCreateAssessmentOutcome,
  clearUpdateAssessmentOutcome,
  createAssessment,
  updateAssessment,
} from '../../../../../../shared/reducers/referrals';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import Switch from '@material-ui/core/Switch';
import { Toast } from '../../../../../../shared/components/toast';
import { useStyles } from './styles';

interface IProps {
  assessment: NewAssessment;
  displayAssessmentModal: boolean;
  readingId: string;
  referral: Referral;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
  updateState: React.Dispatch<Action>;
}

type SelectorState = {
  error: OrNull<string>;
  success: OrNull<string>;
};

export const FollowUpModal: React.FC<IProps> = ({
  assessment,
  displayAssessmentModal,
  readingId,
  referral,
  onAddPatientRequired,
  updateState,
}) => {
  const classes = useStyles();

  const { error, success } = useSelector(
    ({ referrals }: ReduxState): SelectorState => ({
      error: referrals.error,
      success: referrals.success,
    })
  );

  const dispatch = useDispatch();

  const openAssessmentModal = (): void => {
    onAddPatientRequired((): void => {
      updateState(actionCreators.openAssessmentModal());
    }, `You haven't added this patient to your health facility. You need to do that before you can add/edit an assessment. Would like to add this patient?`);
  };

  const closeAssessmentModal = React.useCallback((): void => {
    updateState(actionCreators.closeAssessmentModal());
  }, [updateState]);

  React.useEffect((): void => {
    if (success) {
      closeAssessmentModal();
    }
  }, [closeAssessmentModal, success]);

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.updateAssessment({ name, value }));
  };

  const handleFollowUpNeededChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    value: boolean
  ): void => {
    updateState(
      actionCreators.updateAssessment({ name: `followupNeeded`, value })
    );
  };

  const handleSubmit = (): void => {
    if (referral.id) {
      dispatch(updateAssessment(readingId, referral.id, assessment));
    } else {
      dispatch(createAssessment(readingId, assessment));
    }
  };

  const clearMessage = (): void => {
    dispatch(clearCreateAssessmentOutcome());
    dispatch(clearUpdateAssessmentOutcome());
  };

  return (
    <>
      <Toast
        message={error || success}
        status={error ? `error` : `success`}
        clearMessage={clearMessage}
      />
      <Button
        className={classes.button}
        size="large"
        variant="contained"
        onClick={openAssessmentModal}>
        {referral.isAssessed ? `Update Assessment` : `Assess`}
      </Button>
      <Modal
        onClose={closeAssessmentModal}
        open={displayAssessmentModal}
        closeIcon>
        <Modal.Header>Referral Follow-Up Information</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <Form onSubmit={handleSubmit}>
              <Form.Field
                name="specialInvestigations"
                value={assessment.specialInvestigations}
                control={TextArea}
                label="Special Investigations & Results (If available)"
                placeholder="Patient's action performed for this follow up"
                onChange={handleChange}
                required={true}
              />
              <Form.Field
                name="diagnosis"
                value={assessment.diagnosis}
                control={TextArea}
                label="Final Diagnosis"
                placeholder="Medical diagnosis for the cause of their chief complaint"
                onChange={handleChange}
                required={true}
              />
              <Form.Field
                name="treatment"
                value={assessment.treatment}
                control={TextArea}
                label="Treatment/Operation"
                placeholder="Treatment performed on the patient to remedy their chief complaint"
                onChange={handleChange}
                required={true}
              />
              <Form.Field
                name="medicationPrescribed"
                value={assessment.medicationPrescribed}
                control={TextArea}
                label="Medication Prescribed"
                placeholder="Medication prescribed to the patient to remedy their chief complaint"
                onChange={handleChange}
                required={true}
              />
              <FormControlLabel
                className={classes.followUpNeeded}
                classes={{ label: classes.followUpNeededLabel }}
                control={
                  <Switch
                    id="followupNeeded"
                    checked={assessment.followupNeeded}
                    onChange={handleFollowUpNeededChange}
                    color="primary"
                  />
                }
                label="Follow-up Needed"
              />
              {assessment.followupNeeded && (
                <div className={classes.followUpInstructions}>
                  <Form.Field
                    name="followupInstructions"
                    value={assessment.followupInstructions}
                    control={TextArea}
                    label="Instruction(s) for Follow up"
                    placeholder="Instruction(s) for VHT to help the patient remedy their chief complaint"
                    required={assessment.followupNeeded}
                    onChange={handleChange}></Form.Field>
                </div>
              )}
              <Button className={classes.submit} variant="contained">
                Submit
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </>
  );
};
