import './index.css';

import { Button, Divider, Form } from 'semantic-ui-react';
import {
  CheckedItems,
  PatientNewReading,
  PatientNewReadingReading,
  User,
} from '../../types';
import { GESTATIONAL_AGE_UNITS, PatientInfoForm } from './patientInfoForm';
import React, { Component } from 'react';
import { UrineTestForm, initialUrineTests } from './urineTestForm';
import {
  addNewReading,
  resetNewReadingStatus,
} from '../../shared/reducers/newReadingStatus';

import { BpForm } from './bpForm';
import SweetAlert from 'sweetalert2-react';
import { SymptomForm } from './symptomForm';
import { addNewPatient } from '../../shared/reducers/patients';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';

// import Dialog from '@material-ui/core/Dialog';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogActions from '@material-ui/core/DialogActions';

const symptom: any = [];

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const initState = {
  patient: {
    patientId: '',
    patientName: '',
    patientAge: null,
    patientSex: 'FEMALE',
    isPregnant: true,
    gestationalAgeValue: '',
    gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
    zone: '',
    dob: null,
    villageNumber: '',
    drugHistory: '',
    medicalHistory: '',
  },
  reading: {
    userId: '',
    readingId: '',
    dateTimeTaken: null,
    bpSystolic: '',
    bpDiastolic: '',
    heartRateBPM: '',
    dateRecheckVitalsNeeded: null,
    isFlaggedForFollowup: false,
    symptoms: '',
    urineTests: initialUrineTests,
  },
  checkedItems: {
    none: true,
    headache: false,
    bleeding: false,
    blurredVision: false,
    feverish: false,
    abdominalPain: false,
    unwell: false,
    other: false,
    otherSymptoms: '',
  },
  showSuccessReading: false,
  hasUrineTest: false,
};
interface IProps {
  getCurrentUser: any;
  afterNewPatientAdded: any;
  user: User;
  addNewReading: any;
}

interface IState {
  patient: PatientNewReading;
  reading: PatientNewReadingReading;
  hasUrineTest: boolean;
  checkedItems: CheckedItems;
  showSuccessReading: boolean;
}
class NewReadingPageComponent extends Component<IProps, IState> {
  state = initState;

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
  };

  static getDerivedStateFromProps = (props: any, state: any) => {
    // if (props.newPatientAdded) {
    //   props.afterNewPatientAdded();
    //   return {
    //     ...state,
    //     showSuccessReading: true
    //   };
    // }

    if (props.readingCreated) {
      props.resetNewReadingStatus();
      return {
        ...state,
        showSuccessReading: true,
      };
      // const newPatient = props.newReadingData.patient;
      // newPatient.readings.push(props.newReadingData.reading);
      // props.addNewPatient(newPatient);
      // return state;
    }
    return state;
  };

  handleChange = (event: any) => {
    this.setState({
      patient: {
        ...this.state.patient,
        [event.target.name]: event.target.value,
      },
    });
  };

  handleSelectChange = (e: any, value: any) => {
    if (value.name === 'patientSex' && value.value === 'MALE') {
      this.setState({
        patient: {
          ...this.state.patient,
          patientSex: 'MALE',
          gestationalAgeValue: '',
          isPregnant: false,
        },
      });
    } else {
      this.setState({
        patient: { ...this.state.patient, [value.name]: value.value },
      });
    }
  };

  handleReadingChange = (e: any, value: any) => {
    this.setState({
      reading: { ...this.state.reading, [value.name]: value.value },
    });
  };

  handleUrineTestChange = (e: any, value: any) => {
    this.setState({
      reading: {
        ...this.state.reading,
        urineTests: {
          ...this.state.reading.urineTests,
          [value.name]: value.value,
        },
      },
    });
  };

  handleUrineTestSwitchChange = (e: any) => {
    this.setState({
      hasUrineTest: e.target.checked,
    } as any);
    if (!e.target.checked) {
      this.setState({
        reading: {
          ...this.state.reading,
          urineTests: initialUrineTests,
        },
      });
    }
  };

  handleCheckedChange = (e: any, value: any) => {
    // console.log(value.name)
    // true => false, pop
    if (value.value) {
      if (symptom.indexOf(value.name) >= 0) {
        symptom.pop();
      }
    } else {
      // false => true, push
      if (symptom.indexOf(value.name) < 0) {
        symptom.push(value.name);
      }
    }
    // console.log(symptom)
    if (value.name !== 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop();
      }
      this.setState({
        checkedItems: {
          ...this.state.checkedItems,
          [value.name]: !value.value,
          none: false,
        },
      } as any);
    } else {
      while (symptom.length > 0) {
        symptom.pop();
      }
      this.setState({
        checkedItems: {
          none: true,
          headache: false,
          bleeding: false,
          blurredVision: false,
          feverish: false,
          abdominalPain: false,
          unwell: false,
          other: false,
          otherSymptoms: '',
        },
      } as any);
    }
  };

  handleOtherSymptom = (event: any) => {
    //console.log(event.target)
    this.setState({
      checkedItems: {
        ...this.state.checkedItems,
        [event.target.name]: event.target.value,
      },
    } as any);
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    console.log('Create new submit');
    if (symptom.indexOf('other') >= 0) {
      symptom.pop();
      if (this.state.checkedItems.otherSymptoms !== '') {
        symptom.push(this.state.checkedItems.otherSymptoms);
      }
    }
    if (this.state.patient.patientAge === ``) {
      this.setState({ patient: { ...this.state.patient, patientAge: null } });
    }

    if (this.state.patient.dob !== null) {
      this.setState({
        patient: {
          ...this.state.patient,
          dob: Date.parse(this.state.patient.dob as any) / 1000,
        },
      });
    }
    const readingID = guid();

    const dateTimeTaken = Math.floor(Date.now() / 1000);

    this.setState(
      {
        reading: {
          ...this.state.reading,
          userId: this.props.user.userId.toString(),
          readingId: readingID,
          dateTimeTaken: dateTimeTaken.toString(),
          symptoms: symptom.toString(),
        },
      },
      (): void => {
        const patientData = JSON.parse(JSON.stringify(this.state.patient));
        const readingData = JSON.parse(JSON.stringify(this.state.reading));
        if (!this.state.hasUrineTest) {
          delete readingData.urineTests;
        }

        const newData = {
          patient: patientData,
          reading: readingData,
        };
        console.log(newData);
        this.props.addNewReading(newData);
      }
    );
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    return (
      <div
        style={{
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
        <h1>
          <b>Create a new patient and reading:</b>
        </h1>
        <Divider />
        <Form onSubmit={this.handleSubmit}>
          <PatientInfoForm
            patient={this.state.patient}
            onChange={this.handleSelectChange}
            isEditPage=""
          />
          <div className="leftContainer">
            <BpForm
              reading={this.state.reading}
              onChange={this.handleReadingChange}
            />
            <SymptomForm
              checkedItems={this.state.checkedItems}
              patient={this.state.patient}
              onChange={this.handleCheckedChange}
              onOtherChange={this.handleOtherSymptom}
            />
          </div>
          <div className="rightContainer">
            <UrineTestForm
              reading={this.state.reading}
              onChange={this.handleUrineTestChange}
              onSwitchChange={this.handleUrineTestSwitchChange}
              hasUrineTest={this.state.hasUrineTest}
            />
          </div>

          <div style={{ clear: 'both' }}></div>
          <div className="contentRight">
            <Button style={{ backgroundColor: '#84ced4' }} type="submit">
              Submit
            </Button>
          </div>
        </Form>
        <SweetAlert
          type="success"
          show={this.state.showSuccessReading}
          title="Patient Reading Created!"
          text="Success! You can view the new reading by going to the Patients tab"
          onConfirm={() => this.setState(initState)}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ user, newReadingStatus, patients }: any) => ({
  user: user.current.data,
  createReadingStatusError: newReadingStatus.error,
  readingCreated: newReadingStatus.readingCreated,
  newReadingData: newReadingStatus.message,
  newPatientAdded: patients.newPatientAdded,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      addNewReading,
      addNewPatient,
      resetNewReadingStatus,
      // afterNewPatientAdded
    },
    dispatch
  ),
});

export const NewReadingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReadingPageComponent);
