import { Button, Divider, Form, Header, Input, Modal } from 'semantic-ui-react';
import { INITIAL_URINE_TESTS, URINE_TEST_CHEMICALS } from '../../utils';
import {
  getMomentDate,
  getPrettyDateTime,
  getTrafficIcon,
} from '../../utils';
import {
  getPatients,
  getPatientsRequested,
  updatePatient,
} from '../../reducers/patients';
import {
  getSelectedPatientStatistics,
  getSelectedPatientStatisticsRequested,
} from '../../reducers/selectedPatientStatistics';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { GESTATIONAL_AGE_UNITS } from '../../utils';
import Grid from '@material-ui/core/Grid';
import { Icon } from 'semantic-ui-react';
import Paper from '@material-ui/core/Paper';
import { PatientInfoForm } from '../form/patientInfo';
import React from 'react';
import { ReferralInfo } from './referralInfo';
import SweetAlert from 'sweetalert2-react';
import { SymptomForm } from '../form/symptom';
import Typography from '@material-ui/core/Typography';
import { UrineTestForm } from '../form/urineTest';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../reducers/user/currentUser';
import { getReferrals } from '../../reducers/referrals';
import { calculateShockIndex, getReferralIds, guid } from './utils';
import { newReadingPost } from '../../reducers/newReadingStatus';
import { Reading } from '../../../types';
import { NoPatientSelected } from './noPatientSelected';
import { Title } from './title';
import { AddNewReading } from './addNewReading';
import { MedicalInformation } from './medicalInformation';
import classes from './styles.module.css';
import { VitalsOverTime } from './vitalsOverTime';
import { vitalsOverTime } from './utils';

let symptom: Array<any> = [];

interface IProps {
  selectedPatient: any;
  getReferrals: any;
  getSelectedPatientStatistics: any;
  getPatients: any;
  callbackFromParent: any;
  updatePatient: any;
  user: any;
  selectedPatientStatsList: any;
  newReadingPost: any;
  referrals: any;
}

interface IState {
  displayPatientModal: boolean,
  selectedPatient: {
    readings: any,
    patientName: string,
    patientId: string,
    dob: string,
    patientAge: string,
    patientSex: string,
    isPregnant: boolean,
    gestationalAgeValue: string,
    gestationalAgeUnit: any,
    drugHistory: string,
    medicalHistory: string,
    bpSystolic: string,
    bpDiastolic: string,
    heartRateBPM: string,
  },
  patient: string,
  showVitals: boolean,
  showTrafficLights: boolean,
  displayReadingModal: boolean,
  newReading: {
    userId: string,
    readingId: string,
    dateTimeTaken: string,
    bpSystolic: string,
    bpDiastolic: string,
    heartRateBPM: string,
    dateRecheckVitalsNeeded: string,
    isFlaggedForFollowup: boolean,
    symptoms: string,
    urineTests: any,
  },
  checkedItems: {
    none: boolean,
    headache: boolean,
    bleeding: boolean,
    blurredVision: boolean,
    feverish: boolean,
    abdominalPain: boolean,
    unwell: boolean,
    other: boolean,
    otherSymptoms: string,
  },
  showSuccessReading: boolean,
  selectedPatientCopy: { readings: any },
  hasUrineTest: boolean,
}

const Component: React.FC<IProps> = (props) => {
  const [state, setState] = React.useState<IState>({
    displayPatientModal: false,
    selectedPatient: {
      readings: [], 
      patientName: ``, 
      patientId: ``,
      dob: ``,
      patientAge: ``,
      patientSex: ``,
      isPregnant: false,
      gestationalAgeValue: ``,
      gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
      drugHistory: ``,
      medicalHistory: ``,
      bpSystolic: ``,
      bpDiastolic: ``,
      heartRateBPM: ``,
    },
    patient: ``,
    showVitals: true,
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
      urineTests: INITIAL_URINE_TESTS,
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
  });

  React.useEffect((): void => {
    setState((currentState: IState): IState => ({ ...currentState, selectedPatient: props.selectedPatient }));
  
    props.getReferrals(getReferralIds(props.selectedPatient));
    if (props.selectedPatient) {
      props.getSelectedPatientStatistics(
        props.selectedPatient.patientId
      );
    }
  }, [props.getReferrals, props.getSelectedPatientStatistics, props.selectedPatient]);

  const goBackToPatientsPage = (): void => {
    // go back to patient table
    props.getPatients();
    props.callbackFromParent(false);
  };

  const closePatientModal = (e: any): void => {
    if (e === 'formSubmitted') {
      setState((currentState: IState): IState => ({ 
        ...currentState, 
        displayPatientModal: false, 
      }));
    } else {
      // form not submitted
      // display original patient fields
      setState((currentState: IState): IState => ({ 
        ...currentState,
        selectedPatient: { 
          ...currentState.selectedPatient, 
          ...currentState.selectedPatientCopy 
        },
        displayPatientModal: false,
      }));
    }
  };

  const closeReadingModal = (): void => setState((currentState: IState): IState => ({ 
    ...currentState, 
    displayReadingModal: false 
  }));

  const handleSubmit = (event: any): void => {
    event.preventDefault();

    // pass by value
    let patientData = JSON.parse(JSON.stringify(state.selectedPatient));
    let patientId = patientData.patientId;

    // delete any unnecessary fields
    delete patientData.readings;
    delete patientData.needsAssessment;
    delete patientData.tableData;
    delete patientData.patientId;

    props.updatePatient(patientId, patientData);
    closePatientModal(`formSubmitted`);
  };

  const handleReadingSubmit = (event: any): void => {
    event.preventDefault();

    if (symptom.indexOf('other') >= 0) {
      symptom.pop();
      if (state.checkedItems.otherSymptoms !== '') {
        symptom.push(state.checkedItems.otherSymptoms);
      }
    }

    var dateTime = new Date();
    var readingID = guid();

    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: {
        ...currentState.newReading,
        userId: props.user.userId,
        readingId: readingID,
        dateTimeTaken: dateTime.toJSON(),
        symptoms: symptom.toString(),
      },
    }));

    // TODO: Call this after state updates
    () => {
      let patientData = JSON.parse(
        JSON.stringify(state.selectedPatient)
      );
      let readingData = JSON.parse(JSON.stringify(state.newReading));

      // delete any unnecessary fields
      delete patientData.readings;
      delete patientData.needsAssessment;
      delete patientData.tableData;
      if (!state.hasUrineTest) {
        delete readingData.urineTests;
      }

      let newData = {
        patient: patientData,
        reading: readingData,
      };

      console.log(newData);
      props.newReadingPost(newData);

      newData['reading']['trafficLightStatus'] = calculateShockIndex(
        newData['reading']
      );
      setState({
        selectedPatient: {
          ...state.selectedPatient,
          readings: [
            ...state.selectedPatient.readings,
            newData['reading'],
          ],
        },
        showSuccessReading: true,
        hasUrineTest: false,
      });
      closeReadingModal();
    }
  };

  const handleSelectChange = (_: any, value: any): void => {
    if (value.name === `patientSex` && value.value === `MALE`) {
      setState((currentState: IState): IState => ({
        ...currentState,
        selectedPatient: {
          ...currentState.selectedPatient,
          patientSex: `MALE`,
          gestationalAgeValue: ``,
          isPregnant: false,
        },
      }));
    } else {
      setState((currentState: IState): IState => ({
        ...currentState,
        selectedPatient: {
          ...currentState.selectedPatient,
          [value.name]: value.value,
        },
      }));
    }
  };

  const handleReadingChange = (_: any, value: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: { 
        ...currentState.newReading, 
        [value.name]: value.value 
      },
    }));

  const handleCheckedChange = (_: any, value: any): void => {
    console.log(value.name);
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
    console.log(symptom);
    if (value.name !== 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop();
      }
      setState((currentState: IState): IState => ({
        ...currentState,
        checkedItems: {
          ...currentState.checkedItems,
          [value.name]: !value.value,
          none: false,
        },
      }));
    } else {
      while (symptom.length > 0) {
        symptom.pop();
      }
      setState((currentState: IState): IState => ({
        ...currentState,
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
      }));
    }
  };

  const handleOtherSymptom = (event: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      checkedItems: {
        ...currentState.checkedItems,
        [event.target.name]: event.target.value,
      },
    }));

  const handleUrineTestChange = (_: any, value: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: {
        ...state.newReading,
        urineTests: {
          ...state.newReading.urineTests,
          [value.name]: value.value,
        },
      },
    }));

  const handleUrineTestSwitchChange = (event: any): void => {
    setState((currentState: IState): IState => ({
      ...currentState,
      hasUrineTest: event.target.checked,
    }));

    if (!event.target.checked) {
      setState((currentState: IState): IState => ({
        ...currentState,
        newReading: {
          ...currentState.newReading,
          urineTests: INITIAL_URINE_TESTS,
        },
      }));
    }
  };

  const createReadings = (
    readingId: any,
    dateTimeTaken: any,
    bpDiastolic: any,
    bpSystolic: any,
    heartRateBPM: any,
    symptoms: any,
    trafficLightStatus: any,
    isReferred: any,
    dateReferred: any,
    drugHistory: any,
    medicalHistory: any,
    urineTests: any
  ): any => {
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

  const sortReadings = (readings: Array<Reading>): Array<Reading> => 
    readings.sort((reading: Reading, otherReading: Reading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
    );

  const createReadingObject = (reading: any): any => createReadings(
    reading.readingId,
    reading.dateTimeTaken,
    reading.bpDiastolic,
    reading.bpSystolic,
    reading.heartRateBPM,
    reading.symptoms,
    reading.trafficLightStatus,
    reading.referral ? true : false,
    reading.dateReferred,
    reading.medicalHistory,
    reading.drugHistory,
    reading.urineTests,
  );

  let readings: any = [];

  if (
    state.selectedPatient.readings !== undefined &&
    state.selectedPatient.readings.length > 0
  ) {
    for (var i = 0; i < state.selectedPatient.readings.length; i++) {
      const reading = createReadingObject(
        state.selectedPatient.readings[i]
      );
      readings.push(reading);
    }

    readings = sortReadings(readings);
  }

  return (
    <>
      {state.selectedPatient ? (
        <div style={{ margin: '2.5em 0' }}>
          <Title 
            patientName={state.selectedPatient.patientName} 
            goBackToPatientsPage={goBackToPatientsPage} 
          />
          <AddNewReading setState={setState} />
          <Divider />
          <Grid container={true} direction="row" spacing={4}>
            <MedicalInformation 
              gridClass={classes.grid}
              iconClass={classes.icon}
              paperClass={classes.paper}
              selectedPatient={state.selectedPatient} 
              setState={setState} 
              />
            <VitalsOverTime 
              gridClass={classes.grid}
              iconClass={classes.icon}
              paperClass={classes.paper}
              selectedPatientStatsList={props.selectedPatientStatsList}
              setState={setState}
              showTrafficLights={state.showTrafficLights}
              showVitals={state.showVitals}
              vitalsOverTime={vitalsOverTime({
                bpSystolicReadingsMonthlyData: props.selectedPatientStatsList.bpSystolicReadingsMontly,
                bpDiastolicReadingsMonthlyData: props.selectedPatientStatsList.bpDiastolicReadingsMontly,
                heartRateReadingsMonthlyData: props.selectedPatientStatsList.heartRateReadingsMonthly,
              })}
            />
           </Grid>
          <br />
          <Grid container spacing={0}>
            {readings.map((row: any) => (
              <Grid key={row.readingId} xs={12}>
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
                        <b>Symptoms: </b> {row.symptoms}{' '}
                      </p>
                      {row.urineTests && (
                        <div>
                          <ExpansionPanel>
                            <ExpansionPanelSummary
                              expandIcon={<Icon name="chevron down" />}
                              aria-controls="panel1a-content"
                              id="panel1a-header">
                              <Typography>
                                <b>Urine Tests Result</b>
                              </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                              <Typography>
                                <p>
                                  <b>{URINE_TEST_CHEMICALS.LEUC}: </b>{' '}
                                  {row.urineTests.urineTestLeuc}{' '}
                                </p>
                                <p>
                                  <b>{URINE_TEST_CHEMICALS.NIT}: </b>{' '}
                                  {row.urineTests.urineTestNit}{' '}
                                </p>
                                <p>
                                  <b>{URINE_TEST_CHEMICALS.GLU}: </b>{' '}
                                  {row.urineTests.urineTestGlu}{' '}
                                </p>
                                <p>
                                  <b>{URINE_TEST_CHEMICALS.PRO}: </b>{' '}
                                  {row.urineTests.urineTestPro}{' '}
                                </p>
                                <p>
                                  <b>{URINE_TEST_CHEMICALS.BLOOD}: </b>{' '}
                                  {row.urineTests.urineTestBlood}{' '}
                                </p>
                              </Typography>
                            </ExpansionPanelDetails>
                          </ExpansionPanel>
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
                        referral={props.referrals[row.readingId]}
                      />
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Modal
            closeIcon
            onClose={closePatientModal}
            open={state.displayPatientModal}>
            <Modal.Header>
              Patient Information for ID #
              {state.selectedPatient.patientId}
            </Modal.Header>
            <Modal.Content scrolling>
              <Form onSubmit={handleSubmit}>
                <PatientInfoForm
                  patient={state.selectedPatient}
                  onChange={handleSelectChange}
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
            onClose={closeReadingModal}
            open={state.displayReadingModal}>
            <Modal.Header>Patient Information</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Header>
                  New Patient Reading for ID #
                  {state.selectedPatient.patientId}
                </Header>
                <Form onSubmit={handleReadingSubmit}>
                  <Paper
                    style={{
                      padding: '35px 25px',
                      borderRadius: '15px',
                    }}>
                    <Form.Group widths="equal">
                      <Form.Field
                        name="bpSystolic"
                        value={state.selectedPatient.bpSystolic}
                        control={Input}
                        label="Systolic"
                        type="number"
                        min="10"
                        max="300"
                        onChange={handleReadingChange}
                        required
                      />
                      <Form.Field
                        name="bpDiastolic"
                        value={state.selectedPatient.bpDiastolic}
                        control={Input}
                        label="Diastolic"
                        type="number"
                        min="10"
                        max="300"
                        onChange={handleReadingChange}
                        required
                      />
                      <Form.Field
                        name="heartRateBPM"
                        value={state.selectedPatient.heartRateBPM}
                        control={Input}
                        label="Heart rate"
                        type="number"
                        min="30"
                        max="300"
                        onChange={handleReadingChange}
                        required
                      />
                    </Form.Group>
                  </Paper>
                  <div style={{ marginTop: '25px' }}>
                    <SymptomForm
                      checkedItems={state.checkedItems}
                      patient={state.patient}
                      onChange={handleCheckedChange}
                      onOtherChange={handleOtherSymptom}
                    />
                  </div>
                  <UrineTestForm
                    reading={state.newReading}
                    onChange={handleUrineTestChange}
                    onSwitchChange={handleUrineTestSwitchChange}
                    hasUrineTest={state.hasUrineTest}
                  />
                  <Form.Field control={Button}>Submit</Form.Field>
                </Form>
              </Modal.Description>
            </Modal.Content>
          </Modal>
          <SweetAlert
            type="success"
            show={state.showSuccessReading}
            title="Reading Created!"
            text="Success! You can view the new reading below"
            onConfirm={() => setState({ showSuccessReading: false })}
          />
        </div>
      ) : (
        <NoPatientSelected goBackToPatientsPage={goBackToPatientsPage} />
      )}
    </>
  );
};

const mapStateToProps = ({ user, referrals, patientStats }: any) => ({
  user: user.currentUser,
  referrals: referrals.mappedReferrals,
  selectedPatientStatsList: patientStats.selectedPatientStatsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  getSelectedPatientStatistics: (patientId: any) => {
    dispatch(getSelectedPatientStatisticsRequested());
    dispatch(getSelectedPatientStatistics(patientId));
  },
  ...bindActionCreators(
    {
      getCurrentUser,
      getReferrals,
      newReadingPost,
      updatePatient,
    },
    dispatch
  ),
});

export const PatientSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
