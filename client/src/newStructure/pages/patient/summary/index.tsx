import { Bar, Line } from 'react-chartjs-2';
import { Divider, Form, Select } from 'semantic-ui-react';
import { OrNull, Patient, Reading } from '@types';
import { actionCreators, initialState, reducer } from './reducers';
import {
  addPatientToHealthFacility,
  updateSelectedPatientState,
} from '../../../shared/reducers/patients';
import {
  average,
  createReadingObject,
  getNumOfMonths,
  getNumOfWeeks,
  getReferralIds,
  getTrafficIcon,
  sortReadings,
  unitOptions,
} from './utils';
import {
  getPrettyDateTime,
  getPrettyDateYYYYmmDD,
} from '../../../shared/utils';
import {
  initialUrineTests,
  urineTestChemicals,
} from '../../../shared/components/form/urineTest';
import { useDispatch, useSelector } from 'react-redux';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { AddPatientPrompt } from '../../../shared/components/addPatientPrompt';
import { GESTATIONAL_AGE_UNITS } from '../../../shared/components/form/patient';
import Grid from '@material-ui/core/Grid';
import { Icon } from 'semantic-ui-react';
import { PageHeader } from './header';
import Paper from '@material-ui/core/Paper';
import { PatientStateEnum } from '../../../enums';
import React from 'react';
import { ReadingModal } from './readingModal';
import { ReduxState } from '../../../redux/rootReducer';
import { ReferralInfo } from './referralInfo';
import SweetAlert from 'sweetalert2-react';
import Typography from '@material-ui/core/Typography';
import { getPatientStatistics } from '../../../shared/reducers/patientStatistics';
import { getReferrals } from '../../../shared/reducers/referrals';

interface IProps {
  selectedPatient: Patient;
}

type SelectorState = {
  referrals: OrNull<Record<string, any>>;
  selectedPatientStatsList: any;
  selectedPatientState?: PatientStateEnum;
};

export const PatientSummary: React.FC<IProps> = ({ selectedPatient }) => {
  const {
    referrals,
    selectedPatientStatsList,
    selectedPatientState,
  } = useSelector(
    (state: ReduxState): SelectorState => {
      return {
        referrals: state.referrals.mappedReferrals,
        selectedPatientStatsList: state.patientStatistics.data ?? {},
        selectedPatientState: state.patients.selectedPatientState,
      };
    }
  );

  const [state, updateState] = React.useReducer(reducer, initialState);

  const [oldState, setOldState] = React.useState({
    actionAfterAdding: (): void => {
      return;
    },
    promptMessage: ``,
    displayPatientModal: false,
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
    selectedPatientCopy: {
      readings: [] as Array<Reading>,
    },
    hasUrineTest: false,
  });

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!referrals && selectedPatient) {
      dispatch(getReferrals(getReferralIds(selectedPatient)));
    }
  }, [dispatch, referrals, selectedPatient]);

  React.useEffect((): void => {
    if (selectedPatient.patientId) {
      dispatch(getPatientStatistics(selectedPatient.patientId));
    }
  }, [dispatch, selectedPatient]);

  // * Handles closing the prompt
  const hidePrompt = (): void => {
    updateState(actionCreators.hidePrompt());
  };

  // * Handles confirming that the patient has been added to the health facility
  // * before proceeding with the action
  const onAddPatientRequired = (
    actionAfterAdding: () => void,
    message: string
  ): void => {
    const onPromptConfirmed = (): void => {
      dispatch(updateSelectedPatientState(undefined));
      dispatch(addPatientToHealthFacility(selectedPatient.patientId));
      actionAfterAdding();
    };

    if (selectedPatientState === PatientStateEnum.ADD) {
      updateState(
        actionCreators.showPrompt({
          message,
          onPromptConfirmed,
        })
      );
    } else {
      actionAfterAdding();
    }
  };

  /*const openPatientModal = (): void => {
    onAddPatientRequired((): void => {
      setState((currentState) => ({
        ...currentState,
        displayPatientModal: true,
        selectedPatientCopy: {
          readings: selectedPatient.readings ?? [],
        },
      }));
    }, `You haven't added this patient to your health facility. You need to do that before you can edit this patient. Would like to add this patient?`);
  };*/

  /*const closePatientModal = (event: any): void => {
    if (event === `formSubmitted`) {
      setState((currentState) => ({
        ...currentState,
        displayPatientModal: false,
      }));
    } else {
      // * Form has not been submitted
      // * therefore, display original patient fields
      setState((currentState) => ({
        ...currentState,
        displayPatientModal: false,
        selectedPatient: { ...currentState.selectedPatientCopy },
      }));
    }
  };*/

  const openReadingModal = (): void => {
    onAddPatientRequired(() => {
      updateState(actionCreators.toggleReadingModal());
    }, `You haven't added this patient to your health facility. You need to do that before you can add a reading. Would like to add this patient?`);
  };

  const handleUnitChange = (_: any, value: any): void => {
    if (value.value === 1) {
      setOldState((currentState) => ({
        ...currentState,
        selectedPatient: {
          ...selectedPatient,
          gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
        },
      }));
    } else {
      setOldState((currentState) => ({
        ...currentState,
        selectedPatient: {
          ...selectedPatient,
          gestationalAgeUnit: GESTATIONAL_AGE_UNITS.MONTHS,
        },
      }));
    }
  };

  /*const handleSelectChange = (_: any, value: any): void => {
    if (value.name === `patientSex` && value.value === `MALE`) {
      setState((currentState) => ({
        ...currentState,
        selectedPatient: {
          ...selectedPatient,
          patientSex: `MALE`,
          gestationalAgeValue: ``,
          isPregnant: false,
        },
      }));
    } else if (value.name === `gestationalAgeUnit`) {
      setState((currentState) => ({
        ...currentState,
        selectedPatient: {
          ...selectedPatient,
          [value.name]: value.value,
          gestationalAgeValue:
            value.value === GESTATIONAL_AGE_UNITS.WEEKS
              ? monthsToWeeks(selectedPatient.gestationalAgeValue ?? ``)
              : weeksToMonths(selectedPatient.gestationalAgeValue ?? ``),
        },
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        selectedPatient: {
          ...selectedPatient,
          [value.name]: value.value,
        },
      }));
    }
  };*/

  /*const handleSubmit = (event: any): void => {
    event.preventDefault();

    // * pass by value
    const patientData = JSON.parse(JSON.stringify(selectedPatient));
    const patientId = patientData.patientId;

    // * delete any unnecessary fields
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

    delete patientData.gestationalAgeValue;
    dispatch(updatePatient(patientId, patientData));
    closePatientModal(`formSubmitted`);
  };*/

  /*const showVitals = (): void => {
    setState((currentState) => ({
      ...currentState,
      showVitals: true,
      showTrafficLights: false,
    }));
  };*/

  /*const showTrafficLights = (): void => {
    setState((currentState) => ({
      ...currentState,
      showVitals: false,
      showTrafficLights: true,
    }));
  };*/

  let readings: Array<Reading> = [];

  if (
    selectedPatient.readings !== undefined &&
    selectedPatient.readings.length > 0
  ) {
    for (let i = 0; i < selectedPatient.readings.length; i++) {
      const reading = createReadingObject(selectedPatient.readings[i]);
      readings.push(reading);
    }

    readings = sortReadings(readings);
  }

  let bpSystolicReadingsMontly = {};

  if (selectedPatientStatsList.bpSystolicReadingsMontly) {
    const bpSystolicReadingsData =
      selectedPatientStatsList.bpSystolicReadingsMontly;
    const averageSystolic = Array(12);
    for (let j = 0; j < 12; j++) {
      averageSystolic[j] = average(bpSystolicReadingsData[j]);
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
  if (selectedPatientStatsList.bpDiastolicReadingsMonthly) {
    const bpDiastolicReadingsData =
      selectedPatientStatsList.bpDiastolicReadingsMonthly;
    const averageDiastolic = Array(12);
    for (let l = 0; l < 12; l++) {
      averageDiastolic[l] = average(bpDiastolicReadingsData[l]);
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
  if (selectedPatientStatsList.heartRateReadingsMonthly) {
    const heartRateData = selectedPatientStatsList.heartRateReadingsMonthly;
    const averageHeartRate = Array(12);
    for (let k = 0; k < 12; k++) {
      averageHeartRate[k] = average(heartRateData[k]);
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
  if (selectedPatientStatsList.trafficLightCountsFromDay1) {
    trafficLight = {
      labels: ['GREEN', 'YELLOW UP', 'YELLOW DOWN', 'RED UP', 'RED DOWN'],
      datasets: [
        {
          backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'],
          data: Object.values(
            selectedPatientStatsList.trafficLightCountsFromDay1
          ),
        },
      ],
    };
  }

  return (
    <div>
      <AddPatientPrompt
        addPatient={oldState.actionAfterAdding}
        closeDialog={hidePrompt}
        show={oldState.showPrompt}
        message={oldState.promptMessage}
        positiveText="Yes"
      />
      <div>
        <PageHeader
          title={selectedPatient.patientName}
          openReadingModal={openReadingModal}
        />
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
                  style={{
                    lineHeight: '0.7em',
                  }}
                  name="address card outline"
                  size="large"
                />
                Medical Information
              </Typography>
              <Divider />
              <div
                style={{
                  padding: '20px 50px',
                }}>
                <p>
                  <b>Patient ID: </b> {selectedPatient.patientId}{' '}
                </p>
                <p>
                  <b>Patient Birthday: </b>{' '}
                  {selectedPatient.dob === undefined ||
                  selectedPatient.dob === null
                    ? 'N/A'
                    : getPrettyDateYYYYmmDD(selectedPatient.dob)}{' '}
                </p>
                <p>
                  <b>Patient Age: </b>{' '}
                  {selectedPatient.patientAge === undefined ||
                  selectedPatient.patientAge === null
                    ? 'N/A'
                    : selectedPatient.patientAge}{' '}
                </p>
                <p>
                  <b>Patient Sex: </b> {selectedPatient.patientSex}{' '}
                </p>
                {selectedPatient.patientSex === 'FEMALE' && (
                  <p>
                    <b>Pregnant: </b>{' '}
                    {selectedPatient.isPregnant ? 'Yes' : 'No'}{' '}
                  </p>
                )}
                {selectedPatient.isPregnant && 1 && (
                  <p>
                    <b>Gestational Age: </b>{' '}
                    {selectedPatient.gestationalAgeUnit ===
                    GESTATIONAL_AGE_UNITS.WEEKS
                      ? `${getNumOfWeeks(0)} week(s)`
                      : `${getNumOfMonths(0)} month(s)`}
                    <Form.Field
                      name="gestationalUnits"
                      control={Select}
                      options={unitOptions}
                      placeholder={
                        selectedPatient.gestationalAgeUnit ===
                        GESTATIONAL_AGE_UNITS.WEEKS
                          ? 'Weeks'
                          : 'Months'
                      }
                      onChange={handleUnitChange}
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
                    <Typography>{selectedPatient.drugHistory}</Typography>
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
                    <Typography>{selectedPatient.medicalHistory}</Typography>
                  </AccordionDetails>
                </Accordion>
                <Divider />
                {/* <Button onClick={openPatientModal}>Edit Patient</Button> */}
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
                  style={{
                    lineHeight: '0.7em',
                  }}
                  name="heartbeat"
                  size="large"
                />
                Vitals Over Time
              </Typography>
              <Divider />
              {/* <Button.Group style={{ width: '100%' }}>
                <Button active={state.showVitals} onClick={showVitals}>
                  Show Vitals Over Time
                </Button>
                <Button
                  active={state.showTrafficLights}
                  onClick={showTrafficLights}>
                  Show Traffic Lights
                </Button>
              </Button.Group> */}
              <br />
              <br />
              {oldState.showVitals && (
                <div>
                  <h4
                    style={{
                      margin: '0',
                    }}>
                    Average Vitals Over Time:
                  </h4>
                  <Line data={vitalsOverTime} />
                </div>
              )}
              {oldState.showTrafficLights && (
                <div>
                  <h4
                    style={{
                      margin: '0',
                    }}>
                    Traffic Lights From All Readings:
                  </h4>
                  <Bar
                    data={trafficLight}
                    options={{
                      legend: {
                        display: false,
                      },
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
                        {row.symptoms}
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
                  <div
                    style={{
                      padding: '0px 50px',
                    }}>
                    <ReferralInfo
                      readingId={row.readingId}
                      referral={referrals?.[row.readingId]}
                    />
                  </div>
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* <Modal
          closeIcon
          onClose={closePatientModal}
          open={state.displayPatientModal}>
          <Modal.Header>
            Patient Information for ID #{selectedPatient.patientId}
          </Modal.Header>
          <Modal.Content scrolling>
            <Form onSubmit={handleSubmit}>
              <PatientInfoForm
                patient={selectedPatient}
                onChange={handleSelectChange}
                isEditPage={true}
              />
              <Form.Field style={{ marginTop: '10px' }} control={Button}>
                Submit
              </Form.Field>
            </Form>
          </Modal.Content>
        </Modal> */}
        <ReadingModal
          displayReadingModal={state.displayReadingModal}
          hasUrineTest={state.hasUrineTest}
          newReading={state.newReading}
          otherSymptoms={state.newReading.otherSymptoms}
          selectedPatient={selectedPatient}
          selectedSymptoms={state.selectedSymptoms}
          updateState={updateState}
        />
        <SweetAlert
          type="success"
          show={oldState.showSuccessReading}
          title="Reading Created!"
          text="Success! You can view the new reading below"
          onConfirm={() =>
            setOldState((currentState) => ({
              ...currentState,
              showSuccessReading: false,
            }))
          }
        />
      </div>
    </div>
  );
};
