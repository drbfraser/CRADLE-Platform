// @ts-nocheck

import { Bar, Line } from 'react-chartjs-2';
import { Button, Divider, Form, Header, Input, Modal, Select } from 'semantic-ui-react';
import { GESTATIONAL_AGE_UNITS, PatientInfoForm } from '../form/patient';
import {
  UrineTestForm,
  initialUrineTests,
  urineTestChemicals,
} from '../form/urineTest';
import {
  addPatientToHealthFacility,
  addPatientToHealthFacilityRequested,
  getPatients,
  getPatientsRequested,
  updatePatient,
  updateSelectedPatientState,
} from '../../reducers/patients';
import {
  getMomentDate,
  getPrettyDateTime,
  getPrettyDateUTC,
  monthsToWeeks,
  weeksToMonths,
} from '../../utils';
import {
  getPatientStatistics,
  startRequest,
} from '../../reducers/patientStatistics';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { AddPatientPrompt } from '../addPatientPrompt';
import Grid from '@material-ui/core/Grid';
import { Icon } from 'semantic-ui-react';
import Paper from '@material-ui/core/Paper';
import { PatientStateEnum } from '../../../enums';
import React from 'react';
import { ReduxState } from '../../../redux/rootReducer';
import ReferralInfo from './referralInfo';
import SweetAlert from 'sweetalert2-react';
import { SymptomForm } from '../form/symptom';
import Typography from '@material-ui/core/Typography';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../reducers/user/currentUser';
import { getReferrals } from '../../reducers/referrals';
import { getTrafficIcon } from './utils';
import { newReadingPost } from '../../reducers/newReadingPost';

const symptom = [];
const unitOptions = [
  { key: 'weeks', text: 'Weeks', value: 1 },
  { key: 'months', text: 'Months', value: 2 },
];

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getNumOfWeeks(timestamp) {
  const todaysDate = new Date()
  const gestDate = new Date(timestamp * 1000);
  return Math.round((todaysDate - gestDate) / (7 * 24 * 60 * 60 * 1000))
}

function getNumOfMonths(timestamp) {
  const todaysDate = new Date()
  const gestDate = new Date(timestamp * 1000);
  return todaysDate.getMonth() - gestDate.getMonth() + 
   (12 * (todaysDate.getFullYear() - gestDate.getFullYear()))
}

class Component extends React.Component {
  state = {
    actionAfterAdding: () => {
      return;
    },
    promptMessage: ``,
    displayPatientModal: false,
    selectedPatient: { readings: [] },
    showVitals: true,
    showPrompt: false,
    showTrafficLights: false,
    displayReadingModal: false,
    newReading: {
      userId: '',
      readingId: '',
      dateTimeTaken: '',
      bpSystolic: '',
      bpDiastolic: '',
      heartRateBPM: '',
      dateRecheckVitalsNeeded: '',
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
    selectedPatientCopy: { readings: [] },
    hasUrineTest: false,
  };

  componentDidMount = () => {
    this.setState({ selectedPatient: this.props.selectedPatient });

    this.props.getReferrals(this.getReferralIds(this.props.selectedPatient));
    if (this.props.selectedPatient) {
      this.props.getPatientStatistics(this.props.selectedPatient.patientId);
    }
  };

  // * Handles closing the prompt
  hidePrompt = () => {
    this.setState({ showPrompt: false });
  };

  // * Handles confirming that the patient has been added to the health facility
  // * before proceeding with the action
  onAddPatientRequired = (actionAfterAdding, promptMessage) => {
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

  calculateShockIndex = (reading) => {
    const RED_SYSTOLIC = 160;
    const RED_DIASTOLIC = 110;
    const YELLOW_SYSTOLIC = 140;
    const YELLOW_DIASTOLIC = 90;
    const SHOCK_HIGH = 1.7;
    const SHOCK_MEDIUM = 0.9;

    if (
      reading['bpSystolic'] === undefined ||
      reading['bpDiastolic'] === undefined ||
      reading['heartRateBPM'] === undefined
    )
      return 'NONE';

    const shockIndex = reading['heartRateBPM'] / reading['bpSystolic'];

    const isBpVeryHigh =
      reading['bpSystolic'] >= RED_SYSTOLIC ||
      reading['bpDiastolic'] >= RED_DIASTOLIC;
    const isBpHigh =
      reading['bpSystolic'] >= YELLOW_SYSTOLIC ||
      reading['bpDiastolic'] >= YELLOW_DIASTOLIC;
    const isSevereShock = shockIndex >= SHOCK_HIGH;
    const isShock = shockIndex >= SHOCK_MEDIUM;

    let trafficLight = '';
    if (isSevereShock) {
      trafficLight = 'RED_DOWN';
    } else if (isBpVeryHigh) {
      trafficLight = 'RED_UP';
    } else if (isShock) {
      trafficLight = 'YELLOW_DOWN';
    } else if (isBpHigh) {
      trafficLight = 'YELLOW_UP';
    } else {
      trafficLight = 'GREEN';
    }
    return trafficLight;
  };

  getReferralIds(selectedPatient) {
    const res = [];
    for (const i in selectedPatient.readings) {
      const reading = selectedPatient.readings[i];
      if (reading.referral != null) {
        res.push(reading.referral);
      }
    }
    return res;
  }

  handleBackBtn = () => {
    // go back to patient table
    // for now skip fetching if user was in global search
    if (!this.props.globalSearch) {
      this.props.getPatients();
    }
    this.props.callbackFromParent(false);
  };

  openPatientModal = () => {
    this.onAddPatientRequired((): void => {
      this.setState({
        selectedPatientCopy: { ...this.state.selectedPatient },
      });
      this.setState({ displayPatientModal: true });
    }, `You haven't added this patient to your health facility. You need to do that before you can edit this patient. Would like to add this patient?`);
  };

  closePatientModal = (e) => {
    if (e === 'formSubmitted') {
      this.setState({ displayPatientModal: false });
    } else {
      // form not submitted
      // display original patient fields
      this.setState({
        selectedPatient: { ...this.state.selectedPatientCopy },
        displayPatientModal: false,
      });
    }
  };

  openReadingModal = () => {
    this.onAddPatientRequired(() => {
      this.setState({ displayReadingModal: true });
    }, `You haven't added this patient to your health facility. You need to do that before you can add a reading. Would like to add this patient?`);
  };

  closeReadingModal = () => {
    this.setState({ displayReadingModal: false });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    // pass by value
    const patientData = JSON.parse(JSON.stringify(this.state.selectedPatient));
    const patientId = patientData.patientId;

    // delete any unnecessary fields
    delete patientData.readings;
    delete patientData.needsAssessment;
    delete patientData.tableData;
    delete patientData.patientId;

    if (
      patientData.isPregnant === true &&
      patientData.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
    ) {
      const gestDate = new Date();
      gestDate.setDate(
        gestDate.getDate() - (patientData.gestationalAgeValue as any) * 7
      );
      patientData.gestationalTimestamp = Date.parse(gestDate as any) / 1000;
    }

    if (
      patientData.isPregnant === true &&
      patientData.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.MONTHS
    ) {
      const gestDate = new Date();
      gestDate.setMonth(
        gestDate.getMonth() - (patientData.gestationalAgeValue as any)
      );
      patientData.gestationalTimestamp = Date.parse(gestDate as any) / 1000;
    }
    delete patientData.gestationalAgeValue
    delete patientData.gestationalAgeUnit
    console.log(patientData)
    this.props.updatePatient(patientId, patientData);
    this.closePatientModal('formSubmitted');
  };

  handleReadingSubmit = (event) => {
    event.preventDefault();

    if (symptom.indexOf('other') >= 0) {
      symptom.pop('other');
      if (this.state.checkedItems.otherSymptoms !== '') {
        symptom.push(this.state.checkedItems.otherSymptoms);
      }
    }

    const dateTime = Math.floor(Date.now() / 1000);
    const readingID = guid();

    this.setState(
      {
        newReading: {
          ...this.state.newReading,
          userId: this.props.user.userId,
          readingId: readingID,
          dateTimeTaken: dateTime,
          symptoms: symptom,
          dateRecheckVitalsNeeded: null,
        },
      },
      function () {
        const patientData = JSON.parse(
          JSON.stringify(this.state.selectedPatient)
        );
        const readingData = JSON.parse(JSON.stringify(this.state.newReading));

        // delete any unnecessary fields
        delete patientData.readings;
        delete patientData.needsAssessment;
        delete patientData.tableData;
        if (!this.state.hasUrineTest) {
          delete readingData.urineTests;
        }

        const newData = {
          patient: patientData,
          reading: readingData,
        };

        this.props.newReadingPost(newData);

        newData['reading']['trafficLightStatus'] = this.calculateShockIndex(
          newData['reading']
        );
        this.setState({
          selectedPatient: {
            ...this.state.selectedPatient,
            readings: [
              ...this.state.selectedPatient.readings,
              newData['reading'],
            ],
          },
          showSuccessReading: true,
          hasUrineTest: false,
        });
        this.closeReadingModal();
      }
    );
  };

  handleUnitChange = (e: any, value: any) => {
    if (value.value === 1) {
      this.setState({
        selectedPatient: { ...this.state.selectedPatient, gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS },
      });
    }
    else {
      this.setState({
        selectedPatient: { ...this.state.selectedPatient, gestationalAgeUnit: GESTATIONAL_AGE_UNITS.MONTHS },
      });
    }
  };

  handleSelectChange = (e, value) => {
    if (value.name === 'patientSex' && value.value === 'MALE') {
      this.setState({
        selectedPatient: {
          ...this.state.selectedPatient,
          patientSex: 'MALE',
          gestationalAgeValue: '',
          isPregnant: false,
        },
      });
    } else if (value.name === `gestationalAgeUnit`) {
      this.setState(
        {
          selectedPatient: {
            ...this.state.selectedPatient,
            [value.name]: value.value,
          },
        },
        (): void => {
          this.setState({
            selectedPatient: {
              ...this.state.selectedPatient,
              gestationalAgeValue:
                this.state.selectedPatient.gestationalAgeUnit ===
                GESTATIONAL_AGE_UNITS.WEEKS
                  ? monthsToWeeks(
                      this.state.selectedPatient.gestationalAgeValue
                    )
                  : weeksToMonths(
                      this.state.selectedPatient.gestationalAgeValue
                    ),
            },
          });
        }
      );
    } else {
      this.setState({
        selectedPatient: {
          ...this.state.selectedPatient,
          [value.name]: value.value,
        },
      });
    }
  };

  handleReadingChange = (e, value) => {
    this.setState({
      newReading: { ...this.state.newReading, [value.name]: value.value },
    });
  };

  handleCheckedChange = (e, value) => {
    // true => false, pop
    if (value.value) {
      if (symptom.indexOf(value.name) >= 0) {
        symptom.pop(value.name);
      }
    } else {
      // false => true, push
      if (symptom.indexOf(value.name) < 0) {
        symptom.push(value.name);
      }
    }
    if (value.name !== 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop('none');
      }
      this.setState({
        checkedItems: {
          ...this.state.checkedItems,
          [value.name]: !value.value,
          none: false,
        },
      });
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
      });
    }
  };

  handleOtherSymptom = (event) => {
    this.setState({
      checkedItems: {
        ...this.state.checkedItems,
        [event.target.name]: event.target.value,
      },
    });
  };

  handleUrineTestChange = (event, value) => {
    this.setState({
      newReading: {
        ...this.state.newReading,
        urineTests: {
          ...this.state.newReading.urineTests,
          [value.name]: value.value,
        },
      },
    });
  };

  handleUrineTestSwitchChange = (event) => {
    this.setState({
      hasUrineTest: event.target.checked,
    });
    if (!event.target.checked) {
      this.setState({
        newReading: {
          ...this.state.newReading,
          urineTests: initialUrineTests,
        },
      });
    }
  };

  createReadings = (
    readingId,
    dateTimeTaken,
    bpDiastolic,
    bpSystolic,
    heartRateBPM,
    symptoms,
    trafficLightStatus,
    isReferred,
    dateReferred,
    drugHistory,
    medicalHistory,
    urineTests
  ) => {
    return {
      readingId,
      dateTimeTaken,
      bpDiastolic,
      bpSystolic,
      heartRateBPM,
      symptoms,
      trafficLightStatus,
      isReferred,
      dateReferred,
      drugHistory,
      medicalHistory,
      urineTests,
    };
  };

  sortReadings = (readings) => {
    const sortedReadings = readings.sort(
      (a, b) =>
        getMomentDate(b.dateTimeTaken).valueOf() -
        getMomentDate(a.dateTimeTaken).valueOf()
    );
    return sortedReadings;
  };

  average = (monthlyArray) => {
    if (monthlyArray.length !== 0) {
      let total = 0;
      for (let i = 0; i < monthlyArray.length; i++) {
        total += monthlyArray[i];
      }
      return total / monthlyArray.length;
    }
    return 0;
  };

  showVitals = () => {
    this.setState({ showVitals: true, showTrafficLights: false });
  };

  showTrafficLights = () => {
    this.setState({ showVitals: false, showTrafficLights: true });
  };

  createReadingObject = (reading) => {
    const readingId = reading['readingId'];
    const dateTimeTaken = reading['dateTimeTaken'];
    const bpDiastolic = reading['bpDiastolic'];
    const bpSystolic = reading['bpSystolic'];
    const heartRateBPM = reading['heartRateBPM'];
    const symptoms = reading['symptoms'];
    const trafficLightStatus = reading['trafficLightStatus'];
    const isReferred = reading['referral'] ? true : false;
    const dateReferred = reading['dateReferred'];
    const medicalHistory = reading['medicalHistory'];
    const drugHistory = reading['drugHistory'];
    const urineTests = reading['urineTests'];
    return this.createReadings(
      readingId,
      dateTimeTaken,
      bpDiastolic,
      bpSystolic,
      heartRateBPM,
      symptoms,
      trafficLightStatus,
      isReferred,
      dateReferred,
      medicalHistory,
      drugHistory,
      urineTests
    );
  };

  render() {
    let readings = [];
    if (this.state.selectedPatient.gestationalAgeUnit === undefined)
      this.state.selectedPatient.gestationalAgeUnit = GESTATIONAL_AGE_UNITS.WEEKS
    if (
      this.state.selectedPatient.readings !== undefined &&
      this.state.selectedPatient.readings.length > 0
    ) {
      for (let i = 0; i < this.state.selectedPatient.readings.length; i++) {
        const reading = this.createReadingObject(
          this.state.selectedPatient.readings[i]
        );
        readings.push(reading);
      }

      readings = this.sortReadings(readings);
    }

    let bpSystolicReadingsMontly = {};

    if (this.props.selectedPatientStatsList.bpSystolicReadingsMontly) {
      const bpSystolicReadingsData = this.props.selectedPatientStatsList
        .bpSystolicReadingsMontly;
      const averageSystolic = Array(12);
      for (let j = 0; j < 12; j++) {
        averageSystolic[j] = this.average(bpSystolicReadingsData[j]);
      }

      bpSystolicReadingsMontly = {
        label: 'Systolic',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        pointRadius: 1,
        data: averageSystolic,
      };
    }

    let bpDiastolicReadingsMonthly = {};
    if (this.props.selectedPatientStatsList.bpDiastolicReadingsMonthly) {
      const bpDiastolicReadingsData = this.props.selectedPatientStatsList
        .bpDiastolicReadingsMonthly;
      const averageDiastolic = Array(12);
      for (let l = 0; l < 12; l++) {
        averageDiastolic[l] = this.average(bpDiastolicReadingsData[l]);
      }

      bpDiastolicReadingsMonthly = {
        label: 'Diastolic',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(148,0,211,0.4)',
        borderColor: 'rgba(148,0,211,1)',
        pointRadius: 1,
        data: averageDiastolic,
      };
    }

    let heartRateReadingsMonthly = {};
    if (this.props.selectedPatientStatsList.heartRateReadingsMonthly) {
      const heartRateData = this.props.selectedPatientStatsList
        .heartRateReadingsMonthly;
      const averageHeartRate = Array(12);
      for (let k = 0; k < 12; k++) {
        averageHeartRate[k] = this.average(heartRateData[k]);
      }

      heartRateReadingsMonthly = {
        label: 'Heart Rate',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(255,127,80,0.4)',
        borderColor: 'rgba(255,127,80,1)',
        pointRadius: 1,
        data: averageHeartRate,
      };
    }

    const vitalsOverTime = {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        bpSystolicReadingsMontly,
        bpDiastolicReadingsMonthly,
        heartRateReadingsMonthly,
      ],
    };

    let trafficLight = {};
    if (this.props.selectedPatientStatsList.trafficLightCountsFromDay1) {
      trafficLight = {
        labels: ['GREEN', 'YELLOW UP', 'YELLOW DOWN', 'RED UP', 'RED DOWN'],
        datasets: [
          {
            backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'],
            data: Object.values(
              this.props.selectedPatientStatsList.trafficLightCountsFromDay1
            ),
          },
        ],
      };
    }

    return (
      <div>
        <AddPatientPrompt
          addPatient={this.state.actionAfterAdding}
          closeDialog={this.hidePrompt}
          show={this.state.showPrompt}
          message={this.state.promptMessage}
          positiveText="Yes"
        />
        {this.state.selectedPatient ? (
          <div style={{ margin: '2.5em 0' }}>
            <h1 style={{ width: '70%', margin: '-1.35em 0' }}>
              <Icon
                style={{
                  cursor: 'pointer',
                  lineHeight: '0.7em',
                }}
                size="large"
                name="chevron left"
                onClick={() => this.handleBackBtn()}
              />
              Patient Summary : {this.state.selectedPatient.patientName}
            </h1>
            <Button
              style={{ float: 'right' }}
              onClick={() => this.openReadingModal()}
              icon>
              <Icon name="plus" size="large" />
              <Typography
                variant="body2"
                style={{
                  lineHeight: '1.5em',
                  padding: '10px',
                }}>
                Add New Reading
              </Typography>
            </Button>
            <div style={{ clear: 'both' }}></div>
            <Divider />
            <Grid container direction="row" spacing={4}>
              <Grid
                item
                xs={6}
                style={{
                  minWidth: '500px',
                  height: '100% !important',
                }}>
                <Paper
                  style={{
                    padding: '35px 25px',
                    borderRadius: '15px',
                    height: '100%',
                  }}>
                  <Typography variant="h5" component="h3">
                    <Icon
                      style={{ lineHeight: '0.7em' }}
                      name="address card outline"
                      size="large"
                    />
                    Medical Information
                  </Typography>
                  <Divider />
                  <div style={{ padding: '20px 50px' }}>
                    <p>
                      <b>Patient ID: </b> {this.state.selectedPatient.patientId}{' '}
                    </p>
                    <p>
                      <b>Patient Birthday: </b>{' '}
                      {this.state.selectedPatient.dob === undefined ||
                      this.state.selectedPatient.dob === null
                        ? 'N/A'
                        : getPrettyDateUTC(this.state.selectedPatient.dob)}{' '}
                    </p>
                    <p>
                      <b>Patient Age: </b>{' '}
                      {this.state.selectedPatient.patientAge === undefined ||
                      this.state.selectedPatient.patientAge === null
                        ? 'N/A'
                        : this.state.selectedPatient.patientAge}{' '}
                    </p>
                    <p>
                      <b>Patient Sex: </b>{' '}
                      {this.state.selectedPatient.patientSex}{' '}
                    </p>
                    {this.state.selectedPatient.patientSex === 'FEMALE' && (
                      <p>
                        <b>Pregnant: </b>{' '}
                        {this.state.selectedPatient.isPregnant ? 'Yes' : 'No'}{' '}
                      </p>
                    )}
                    {this.state.selectedPatient.isPregnant &&
                      this.state.selectedPatient.gestationalTimestamp && (
                        <p>
                          <b>Gestational Age: </b>{' '}
                          {/* {getNumOfWeeks(this.state.selectedPatient.gestationalTimestamp)}{' '} */}
                          {this.state.selectedPatient.gestationalAgeUnit ===
                          GESTATIONAL_AGE_UNITS.WEEKS
                            ? getNumOfWeeks(this.state.selectedPatient.gestationalTimestamp) + ' week(s)'
                            : getNumOfMonths(this.state.selectedPatient.gestationalTimestamp) + ' month(s)'}
                            <Form.Field
                              name="gestationalUnits"
                              control={Select}
                              options={unitOptions}
                              placeholder="Weeks"
                              onChange={this.handleUnitChange}
                            />
                        </p>
                      )}
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<Icon name="chevron down" />}
                        aria-controls="panel1a-content"
                        id="panel1a-header">
                        <Typography>Drug History</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          {this.state.selectedPatient.drugHistory}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<Icon name="chevron down" />}
                        aria-controls="panel1a-content"
                        id="panel1a-header">
                        <Typography>Medical History</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          {this.state.selectedPatient.medicalHistory}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Divider />
                    <Button onClick={() => this.openPatientModal()}>
                      Edit Patient
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid
                item
                xs={6}
                style={{
                  minWidth: '500px',
                  height: '100% !important',
                }}>
                <Paper
                  style={{
                    padding: '35px 25px 0px',
                    borderRadius: '15px',
                    height: '100%',
                  }}>
                  <Typography variant="h5" component="h3">
                    <Icon
                      style={{ lineHeight: '0.7em' }}
                      name="heartbeat"
                      size="large"
                    />
                    Vitals Over Time
                  </Typography>
                  <Divider />
                  <Button.Group style={{ width: '100%' }}>
                    <Button
                      active={this.state.showVitals}
                      onClick={() => this.showVitals()}>
                      Show Vitals Over Time
                    </Button>
                    <Button
                      active={this.state.showTrafficLights}
                      onClick={() => this.showTrafficLights()}>
                      Show Traffic Lights
                    </Button>
                  </Button.Group>
                  <br />
                  <br />
                  {this.state.showVitals && (
                    <div>
                      <h4 style={{ margin: '0' }}>Average Vitals Over Time:</h4>
                      <Line data={vitalsOverTime} />
                    </div>
                  )}
                  {this.state.showTrafficLights && (
                    <div>
                      <h4 style={{ margin: '0' }}>
                        Traffic Lights From All Readings:
                      </h4>
                      <Bar
                        data={trafficLight}
                        options={{
                          legend: { display: false },
                          scales: {
                            xAxes: [
                              {
                                ticks: {
                                  fontSize: 10,
                                },
                              },
                            ],
                            yAxes: [
                              {
                                ticks: {
                                  beginAtZero: true,
                                },
                              },
                            ],
                          },
                        }}
                      />
                    </div>
                  )}
                </Paper>
              </Grid>
            </Grid>
            <br />
            <Grid container={true} spacing={0}>
              {readings.map((row) => (
                <Grid key={row.readingId} item={true} xs={12}>
                  <Paper
                    style={{
                      marginBottom: '35px',
                      height: 'auto',
                      padding: '45px 50px',
                      borderRadius: '15px',
                      display: 'flex',
                    }}>
                    <div
                      style={{
                        display: 'inline-block',
                        width: '50%',
                      }}>
                      <Typography variant="h4" component="h4">
                        Reading
                      </Typography>

                      <Typography variant="subtitle1">
                        Taken on {getPrettyDateTime(row.dateTimeTaken)}
                      </Typography>

                      <div
                        style={{
                          padding: '25px 50px',
                        }}>
                        {getTrafficIcon(row.trafficLightStatus)}
                        <br />
                        <br />
                        <p>
                          <b>Systolic Blood Pressure: </b> {row.bpSystolic}{' '}
                        </p>
                        <p>
                          <b>Diastolic Blood Pressure: </b> {row.bpDiastolic}{' '}
                        </p>
                        <p>
                          <b>Heart Rate (BPM): </b> {row.heartRateBPM}{' '}
                        </p>
                        <p>
                          <b>Symptoms</b>
                          <div
                            style={{
                              display: `flex`,
                              flexDirection: `column`,
                            }}>
                            {row.symptoms.map(
                              (symptom): JSX.Element => (
                                <span key={symptom}>{symptom}</span>
                              )
                            )}
                          </div>
                        </p>
                        {row.urineTests && (
                          <div>
                            <Accordion>
                              <AccordionSummary
                                expandIcon={<Icon name="chevron down" />}
                                aria-controls="panel1a-content"
                                id="panel1a-header">
                                <Typography>
                                  <b>Urine Tests Result</b>
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography>
                                  <p>
                                    <b>{urineTestChemicals.LEUC}: </b>{' '}
                                    {row.urineTests.urineTestLeuc}{' '}
                                  </p>
                                  <p>
                                    <b>{urineTestChemicals.NIT}: </b>{' '}
                                    {row.urineTests.urineTestNit}{' '}
                                  </p>
                                  <p>
                                    <b>{urineTestChemicals.GLU}: </b>{' '}
                                    {row.urineTests.urineTestGlu}{' '}
                                  </p>
                                  <p>
                                    <b>{urineTestChemicals.PRO}: </b>{' '}
                                    {row.urineTests.urineTestPro}{' '}
                                  </p>
                                  <p>
                                    <b>{urineTestChemicals.BLOOD}: </b>{' '}
                                    {row.urineTests.urineTestBlood}{' '}
                                  </p>
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        borderLeft: '2px solid #84ced4',
                        display: 'inline-block',
                        width: '50%',
                        float: 'right',
                        height: '100%',
                      }}>
                      <div style={{ padding: '0px 50px' }}>
                        <ReferralInfo
                          readingId={row.readingId}
                          referral={this.props.referrals[row.readingId]}
                        />
                      </div>
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Modal
              closeIcon
              onClose={this.closePatientModal}
              open={this.state.displayPatientModal}>
              <Modal.Header>
                Patient Information for ID #
                {this.state.selectedPatient.patientId}
              </Modal.Header>
              <Modal.Content scrolling>
                <Form onSubmit={this.handleSubmit}>
                  <PatientInfoForm
                    patient={this.state.selectedPatient}
                    onChange={this.handleSelectChange}
                    isEditPage={true}
                  />
                  <Form.Field style={{ marginTop: '10px' }} control={Button}>
                    Submit
                  </Form.Field>
                </Form>
              </Modal.Content>
            </Modal>
            <Modal
              closeIcon
              onClose={this.closeReadingModal}
              open={this.state.displayReadingModal}>
              <Modal.Header>Patient Information</Modal.Header>
              <Modal.Content scrolling>
                <Modal.Description>
                  <Header>
                    New Patient Reading for ID #
                    {this.state.selectedPatient.patientId}
                  </Header>
                  <Form onSubmit={this.handleReadingSubmit}>
                    <Paper
                      style={{
                        padding: '35px 25px',
                        borderRadius: '15px',
                      }}>
                      <Form.Group widths="equal">
                        <Form.Field
                          name="bpSystolic"
                          value={this.state.selectedPatient.bpSystolic}
                          control={Input}
                          label="Systolic"
                          type="number"
                          min="10"
                          max="300"
                          onChange={this.handleReadingChange}
                          required
                        />
                        <Form.Field
                          name="bpDiastolic"
                          value={this.state.selectedPatient.bpDiastolic}
                          control={Input}
                          label="Diastolic"
                          type="number"
                          min="10"
                          max="300"
                          onChange={this.handleReadingChange}
                          required
                        />
                        <Form.Field
                          name="heartRateBPM"
                          value={this.state.selectedPatient.heartRateBPM}
                          control={Input}
                          label="Heart rate"
                          type="number"
                          min="30"
                          max="300"
                          onChange={this.handleReadingChange}
                          required
                        />
                      </Form.Group>
                    </Paper>
                    <div style={{ marginTop: '25px' }}>
                      <SymptomForm
                        checkedItems={this.state.checkedItems}
                        patient={this.state.patient}
                        onChange={this.handleCheckedChange}
                        onOtherChange={this.handleOtherSymptom}
                      />
                    </div>
                    <UrineTestForm
                      reading={this.state.newReading}
                      onChange={this.handleUrineTestChange}
                      onSwitchChange={this.handleUrineTestSwitchChange}
                      hasUrineTest={this.state.hasUrineTest}
                    />
                    <Form.Field control={Button}>Submit</Form.Field>
                  </Form>
                </Modal.Description>
              </Modal.Content>
            </Modal>
            <SweetAlert
              type="success"
              show={this.state.showSuccessReading}
              title="Reading Created!"
              text="Success! You can view the new reading below"
              onConfirm={() => this.setState({ showSuccessReading: false })}
            />
          </div>
        ) : (
          <div>
            <Button onClick={() => this.handleBackBtn()}>Back</Button>
            <h2>No patient selected</h2>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({
  user,
  referrals,
  patientStatistics,
  patients,
}: ReduxState) => ({
  globalSearch: patients.globalSearch,
  user: user.current.data,
  referrals: referrals.mappedReferrals,
  selectedPatientStatsList: patientStatistics.data ?? {},
  selectedPatientState: patients.selectedPatientState,
  selectedPatient: patients.patient,
});

const mapDispatchToProps = (dispatch) => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  addPatientToHealthFacility: (patient: GlobalSearchPatient): void => {
    dispatch(addPatientToHealthFacilityRequested(patient));
    dispatch(addPatientToHealthFacility(patient));
  },
  getPatientStatistics: (petientId) => {
    dispatch(startRequest());
    dispatch(getPatientStatistics(petientId));
  },
  ...bindActionCreators(
    {
      getReferrals,
      getCurrentUser,
      updatePatient,
      newReadingPost,
      updateSelectedPatientState,
    },
    dispatch
  ),
});

export const PatientSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
