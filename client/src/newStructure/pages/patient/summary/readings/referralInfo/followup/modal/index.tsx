import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  TextArea,
} from 'semantic-ui-react';
import { Dispatch, bindActionCreators } from 'redux';
import {
  addPatientToHealthFacility,
  updateSelectedPatientState,
} from '../../../../../../../shared/reducers/patients';
import {
  createFollowUp,
  setReadingId,
  updateFollowUp,
} from '../../../../../../../shared/reducers/referrals';

import { AddPatientPrompt } from '../../../../../../../shared/components/addPatientPrompt';
import { PatientStateEnum } from '../../../../../../../enums';
import React from 'react';
import { ReduxState } from '../../../../../../../redux/rootReducer';
import Switch from '@material-ui/core/Switch';
import { connect } from 'react-redux';
import { followupFrequencyUnitOptions } from '../utils';

const untilDateOrOther = [
  { key: 'date', text: 'Date', value: 'DATE' },
  { key: 'other', text: 'Other', value: 'OTHER' },
];

class Component extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      actionAfterAdding: () => {
        return;
      },
      promptMessage: ``,
      showPrompt: false,
      data: {
        diagnosis: '',
        treatment: '',
        specialInvestigations: '',
        medicationPrescribed: '',
        followupNeeded: false,
        dateFollowupNeededTill: '',
        followupInstructions: '',
        followupFrequencyUnit: followupFrequencyUnitOptions[0].value,
        followupFrequencyValue: null,
      },
      isOpen: false,
      dateOrOther: 'DATE',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.loadInitialValues = this.loadInitialValues.bind(this);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);

    this.loadInitialValues();
  }

  // * Handles closing the prompt
  hidePrompt = () => {
    this.setState({ showPrompt: false });
  };

  // * Handles confirming that the patient has been added to the health facility
  // * before proceeding with the action
  onAddPatientRequired = (
    actionAfterAdding: () => void,
    promptMessage: string
  ): void => {
    const onAddPatient = () => {
      this.props.updateSelectedPatientState(undefined);
      this.props.addPatientToHealthFacility(
        this.props.selectedPatient.patientId
      );
      actionAfterAdding();
    };

    if (this.props.selectedPatientState === PatientStateEnum.ADD) {
      this.setState({
        promptMessage,
        showPrompt: true,
        actionAfterAdding: onAddPatient,
      });
    } else {
      actionAfterAdding();
    }
  };

  loadInitialValues() {
    this.setState({
      data: Object.keys(this.state.data).reduce(
        (values: Record<string, any>, key: string): Record<string, any> => {
          if (this.props.initialValues && this.props.initialValues[key]) {
            values[key] = this.props.initialValues[key];
          }
          return values;
        },
        {}
      ),
    });
  }

  handleOpen() {
    this.onAddPatientRequired((): void => {
      this.setState(
        {
          isOpen: true,
        },
        () => {
          this.loadInitialValues();
        }
      );
    }, `You haven't added this patient to your health facility. You need to do that before you can add/edit an assessment. Would like to add this patient?`);
  }

  handleClose() {
    this.setState({
      isOpen: false,
    });
  }

  onOpen() {
    this.props.setReadingId(this.props.readingId);
  }

  handleChange(_: any, value: any) {
    this.setState({
      data: {
        ...this.state.data,
        [value.name]: value.value,
      },
    });
  }

  handleSwitchChange(event: any) {
    this.setState({
      data: {
        ...this.state.data,
        followupNeeded: event.target.checked,
      },
    });
  }

  handleDateOrOtherChange = (_: any, value: any) => {
    if (
      value.name === `untilDateOrOther` &&
      (value.value === `OTHER` || value.value === `DATE`)
    ) {
      this.setState({ dateOrOther: value.value });
    }
  };

  handleSubmit() {
    const followupData = this.state.data;
    followupData.referral = this.props.referralId;

    if (this.state.dateOrCondition === `DATE`) {
      // divide by 1000 to convert ms into s
      followupData.dateFollowupNeededTill =
        Date.parse(this.state.data.dateFollowupNeededTill) / 1000;
    }

    if (this.state.untilDateOrCond) {
      // * delete this.state.untilDateOrCond;
    }

    const {
      followupFrequencyUnit,
      followupFrequencyValue,
      ...data
    } = followupData;
    const followup = {
      ...data,
      ...(followupFrequencyUnit === followupFrequencyUnitOptions[0].value
        ? {}
        : {
            followupFrequencyUnit,
            followupFrequencyValue: followupFrequencyValue || 0,
          }),
    };

    // update existing followUpInfo
    if (this.props.initialValues) {
      this.props.updateFollowUp(this.props.initialValues['id'], followup);
    } else {
      // create new followUpInfo
      // TODO: remove this once mobile is up to date with the new assessment changes
      // followupData.followUpAction = followupData.specialInvestigations;

      if (!followupData.followupNeeded) {
        delete followupData.dateFollowupNeededTill;
      }

      this.props.createFollowUp(followup);
    }

    this.handleClose();
  }

  render() {
    return (
      <div>
        <AddPatientPrompt
          addPatient={this.state.actionAfterAdding}
          closeDialog={this.hidePrompt}
          show={this.state.showPrompt}
          message={this.state.promptMessage}
          positiveText="Yes"
        />
        <Modal
          trigger={
            <Button
              style={{ backgroundColor: '#84ced4', marginTop: 16 }}
              size="large"
              onClick={this.handleOpen}>
              {this.props.initialValues ? 'Update Assessment' : 'Assess'}
            </Button>
          }
          onClose={this.handleClose}
          onOpen={this.onOpen}
          open={this.state.isOpen}
          closeIcon>
          <Modal.Header>Referral Follow-Up Information</Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>
              <Form onSubmit={this.handleSubmit}>
                <Form.Field
                  name="specialInvestigations"
                  value={this.state.data.specialInvestigations || ''}
                  control={TextArea}
                  label="Special Investigations + Results (If available)"
                  placeholder="Patient's action performed for this follow up"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="diagnosis"
                  value={this.state.data.diagnosis || ''}
                  control={TextArea}
                  label="Final Diagnosis"
                  placeholder="Medical diagnosis of the cause of their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="treatment"
                  value={this.state.data.treatment || ''}
                  control={TextArea}
                  label="Treatment/Operation"
                  placeholder="Treatment performed on patient to remedy their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="medicationPrescribed"
                  value={this.state.data.medicationPrescribed || ''}
                  control={TextArea}
                  label="Medication Prescribed"
                  placeholder="Medication prescribed to patient to remedy their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field style={{ margin: '0px' }}>
                  <label
                    style={{
                      display: 'inline-block',
                      marginRight: '5px',
                    }}>
                    Follow-up Needed
                  </label>
                  <Switch
                    className="followupNeeded"
                    checked={this.state.data.followupNeeded}
                    onChange={this.handleSwitchChange}
                    color="primary"
                  />
                </Form.Field>
                {this.state.data.followupNeeded && (
                  <Form>
                    <Form.Field
                      name="followupInstructions"
                      value={this.state.data.followupInstructions || ''}
                      control={TextArea}
                      label="Instructions for Follow up"
                      placeholder="Instruction for VHT to help patient to remedy their chief complaint"
                      onChange={this.handleChange}></Form.Field>
                    <Form.Group widths="equal">
                      <Form.Field
                        name="followupFrequencyValue"
                        value={this.state.data.followupFrequencyValue || ''}
                        control={Input}
                        type="number"
                        min="1"
                        label="Frequency"
                        placeholder="Number"
                        onChange={this.handleChange}></Form.Field>
                      <Form.Field
                        name="followupFrequencyUnit"
                        value={this.state.data.followupFrequencyUnit || 'N/A'}
                        control={Select}
                        options={followupFrequencyUnitOptions}
                        label="Frequency Unit"
                        onChange={this.handleChange}></Form.Field>
                    </Form.Group>
                    <Form.Group>
                      <Form.Field
                        name="untilDateOrOther"
                        value={this.state.dateOrOther}
                        control={Select}
                        options={untilDateOrOther}
                        label="Until:"
                        onChange={this.handleDateOrOtherChange}></Form.Field>
                      <Form.Field
                        name="dateFollowupNeededTill"
                        control={Input}
                        type="date"
                        label="Until Date"
                        disabled={this.state.dateOrOther === 'OTHER'}
                        onChange={this.handleChange}></Form.Field>
                      <Form.Field
                        name="dateFollowupNeededTill"
                        control={TextArea}
                        label="Other"
                        disabled={this.state.dateOrOther === 'DATE'}
                        onChange={this.handleChange}></Form.Field>
                    </Form.Group>
                  </Form>
                )}
                <Form.Field control={Button} style={{ marginTop: '10px' }}>
                  Submit
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ patients }: ReduxState) => ({
  selectedPatient: patients.patient,
  selectedPatientState: patients.selectedPatientState,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addPatientToHealthFacility,
      updateFollowUp,
      setReadingId,
      createFollowUp,
      updateSelectedPatientState,
    },
    dispatch
  );
};
export const FollowUpModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
