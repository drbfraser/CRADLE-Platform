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
  Input,
  Modal,
  Select,
  TextArea,
} from 'semantic-ui-react';
import {
  createFollowUp,
  setReadingId,
  updateFollowUp,
} from '../../../../../../reducers/referrals';

import React from 'react';
import Switch from '@material-ui/core/Switch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { followupFrequencyUnitOptions } from '../utils';
import { untilDateOrOther } from './utils';

interface IProps {
  initialValues: { [key: string]: string },
  updateFollowUp: any,
  referralId: string,
  readingId: string,
  setReadingId: any,
  createFollowUp: any,
}

interface IState {
  data: any,
  isOpen: boolean,
  dateOrOther: string,
  untilDateOrCond: any,
}

class Component extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      data: {
        diagnosis: ``,
        treatment: ``,
        specialInvestigations: ``,
        medicationPrescribed: ``,
        followupNeeded: false,
        dateFollowupNeededTill: ``,
        followupInstructions: ``,
        followupFrequencyUnit: followupFrequencyUnitOptions[0],
        followupFrequencyValue: null,
      },
      isOpen: false,
      dateOrOther: `DATE`,
      untilDateOrCond: undefined
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

  loadInitialValues() {
    if (this.props.initialValues) {
      for (let key in this.state.data) {
        if (key in this.props.initialValues) {
          this.state.data[key] = this.props.initialValues[key];
        }
      }
    }
  }

  handleOpen() {
    this.setState(
      {
        isOpen: true,
      },
      () => {
        this.loadInitialValues();
        this.setState(this.state);
      }
    );
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

  handleSwitchChange(e: any) {
    this.setState({
      data: {
        ...this.state.data,
        followupNeeded: e.target.checked,
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
    this.state.data.referral = this.props.referralId;

    if (this.state.dateOrOther === `DATE`) {
      this.state.data.dateFollowupNeededTill =
        Date.parse(this.state.data.dateFollowupNeededTill) / 1000; // divide by 1000 to convert ms into s
    }

    if (this.state.untilDateOrCond) {
      this.setState({ untilDateOrCond: undefined })
    }
    // update existing followUpInfo
    if (this.props.initialValues) {
      this.props.updateFollowUp(
        this.props.initialValues['id'],
        this.state.data
      );
    } else {
      // create new followUpInfo
      const followupData = this.state.data;
      // TODO: remove this once mobile is up to date with the new assessment changes
      // followupData.followUpAction = followupData.specialInvestigations;

      if (!followupData.followupNeeded) {
        delete followupData.dateFollowupNeededTill;
      }
      this.props.createFollowUp(this.state.data);
    }

    this.handleClose();
  }

  render() {
    return (
      <div>
        <Modal
          trigger={
            <Button
              style={{ backgroundColor: `#84ced4` }}
              size="large"
              onClick={this.handleOpen}>
              {this.props.initialValues ? `Update Assessment` : `Assess`}
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
                  value={this.state.data.specialInvestigations || ``}
                  control={TextArea}
                  label="Special Investigations + Results (If available)"
                  placeholder="Patient's action performed for this follow up"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="diagnosis"
                  value={this.state.data.diagnosis || ``}
                  control={TextArea}
                  label="Final Diagnosis"
                  placeholder="Medical diagnosis of the cause of their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="treatment"
                  value={this.state.data.treatment || ``}
                  control={TextArea}
                  label="Treatment/Operation"
                  placeholder="Treatment performed on patient to remedy their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field
                  name="medicationPrescribed"
                  value={this.state.data.medicationPrescribed || ``}
                  control={TextArea}
                  label="Medication Prescribed"
                  placeholder="Medication prescribed to patient to remedy their chief complaint"
                  onChange={this.handleChange}
                  required
                />
                <Form.Field style={{ margin: `0px` }}>
                  <label
                    style={{
                      display: `inline-block`,
                      marginRight: `5px`,
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
                      value={this.state.data.followupInstructions || ``}
                      control={TextArea}
                      label="Instructions for Follow up"
                      placeholder="Instruction for VHT to help patient to remedy their chief complaint"
                      onChange={this.handleChange}></Form.Field>
                    <Form.Group widths="equal">
                      <Form.Field
                        name="followupFrequencyValue"
                        value={this.state.data.followupFrequencyValue || ``}
                        control={Input}
                        type="number"
                        min="1"
                        label="Frequency"
                        placeholder="Number"
                        onChange={this.handleChange}></Form.Field>
                      <Form.Field
                        name="followupFrequencyUnit"
                        value={this.state.data.followupFrequencyUnit || `N/A`}
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
                        disabled={this.state.dateOrOther === `OTHER`}
                        onChange={this.handleChange}></Form.Field>
                      <Form.Field
                        name="dateFollowupNeededTill"
                        control={TextArea}
                        label="Other"
                        disabled={this.state.dateOrOther === `DATE`}
                        onChange={this.handleChange}></Form.Field>
                    </Form.Group>
                  </Form>
                )}
                <Form.Field control={Button} style={{ marginTop: `10px` }}>
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

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch: any) => ({
  createFollowUp: (data: any) => dispatch(createFollowUp(data)),
  ...bindActionCreators(
    {
      updateFollowUp,
      setReadingId,
    },
    dispatch
  ),
});

export const FollowUpModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
