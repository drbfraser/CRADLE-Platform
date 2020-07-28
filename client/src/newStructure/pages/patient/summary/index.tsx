import { OrNull, Patient, Reading } from '@types';
import { actionCreators, initialState, reducer } from './reducers';
import {
  addPatientToHealthFacility,
  updateSelectedPatientState,
} from '../../../shared/reducers/patients';
import { getReferralIds, getTrafficIcon } from './utils';
import {
  initialUrineTests,
  urineTestChemicals,
} from '../../../shared/components/form/urineTest';
import { useDispatch, useSelector } from 'react-redux';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { AddPatientPrompt } from '../../../shared/components/addPatientPrompt';
import { Divider } from 'semantic-ui-react';
import Grid from '@material-ui/core/Grid';
import { Icon } from 'semantic-ui-react';
import { MedicalInformation } from './medicalInformation';
import { PageHeader } from './header';
import Paper from '@material-ui/core/Paper';
import { PatientStateEnum } from '../../../enums';
import React from 'react';
import { ReadingModal } from './readingModal';
import { ReduxState } from '../../../redux/rootReducer';
import { ReferralInfo } from './referralInfo';
import Typography from '@material-ui/core/Typography';
import { VitalsOverTime } from './vitalsOverTime';
import { getPatientStatistics } from '../../../shared/reducers/patientStatistics';
import { getPrettyDateTime } from '../../../shared/utils';
import { getReferrals } from '../../../shared/reducers/referrals';
import { useReadings } from './hooks/readings';

interface IProps {
  selectedPatient: Patient;
}

type SelectorState = {
  referrals: OrNull<Record<string, any>>;
  selectedPatientState?: PatientStateEnum;
};

export const PatientSummary: React.FC<IProps> = ({ selectedPatient }) => {
  const { referrals, selectedPatientState } = useSelector(
    (state: ReduxState): SelectorState => {
      return {
        referrals: state.referrals.mappedReferrals,
        selectedPatientState: state.patients.selectedPatientState,
      };
    }
  );

  const [state, updateState] = React.useReducer(reducer, initialState);

  const [oldState] = React.useState({
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

  const openReadingModal = (): void => {
    onAddPatientRequired(() => {
      updateState(actionCreators.openReadingModal());
    }, `You haven't added this patient to your health facility. You need to do that before you can add a reading. Would like to add this patient?`);
  };

  const readings = useReadings(selectedPatient);

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
          <MedicalInformation
            displayPatientModal={state.displayPatientModal}
            editedPatient={state.editedPatient}
            selectedPatient={selectedPatient}
            onAddPatientRequired={onAddPatientRequired}
            updateState={updateState}
          />
          <VitalsOverTime
            showingVitals={state.showVitals}
            showingTrafficLights={state.showTrafficLights}
            updateState={updateState}
          />
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
                    <div>
                      <b>Symptoms</b>
                      <div
                        style={{
                          display: `flex`,
                          flexDirection: `column`,
                        }}>
                        {row.symptoms}
                      </div>
                    </div>
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
                            <div>
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
                            </div>
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
        <ReadingModal
          displayReadingModal={state.displayReadingModal}
          hasUrineTest={state.hasUrineTest}
          newReading={state.newReading}
          otherSymptoms={state.otherSymptoms}
          selectedPatient={selectedPatient}
          selectedSymptoms={state.selectedSymptoms}
          updateState={updateState}
        />
      </div>
    </div>
  );
};
