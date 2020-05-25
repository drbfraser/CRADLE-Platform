import { Divider } from 'semantic-ui-react';
import {
  getPatients,
  getPatientsRequested,
  updatePatient,
} from '../../reducers/patients';
import {
  getSelectedPatientStatistics,
  getSelectedPatientStatisticsRequested,
} from '../../reducers/selectedPatientStatistics';

import React from 'react';
import SweetAlert from 'sweetalert2-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../reducers/user/currentUser';
import { getReferrals } from '../../reducers/referrals';
import { calculateShockIndex, getReferralIds, guid, createReading, sortReadings, initialState, IState } from './utils';
import { newReadingPost } from '../../reducers/newReadingStatus';
import { NoPatientSelected } from './noPatientSelected';
import { Title } from './title';
import { AddNewReading } from './addNewReading';
import { Readings } from './readings';
import { PatientModal } from './modal/patient';
import { NewPatientModal } from "./modal/newPatient";
import { SummaryGrid } from "./grid";

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

const Component: React.FC<IProps> = (props) => {
  const [state, setState] = React.useState<IState>(initialState);

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

  const closeReadingModal = (): void => setState((currentState: IState): IState => ({ 
    ...currentState, 
    displayReadingModal: false 
  }));

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
          <SummaryGrid 
            selectedPatient={state.selectedPatient}
            selectedPatientStatsList={props.selectedPatientStatsList}
            setState={setState}
            showTrafficLights={state.showTrafficLights}
            showVitals={state.showVitals}
          />
          <br />
          <Readings readings={ sortReadings(state.selectedPatient.readings.map((item: any): any => createReading(
            item
          )))} referrals={props.referrals} />
          <PatientModal 
            displayPatientModal={state.displayPatientModal} 
            selectedPatient={state.selectedPatient}
            setState={setState}
            updatePatient={props.updatePatient}
          />
          <NewPatientModal 
            checkedItems={state.checkedItems}
            displayReadingModal={state.displayReadingModal}
            handleReadingSubmit={handleReadingSubmit}
            hasUrineTest={state.hasUrineTest}
            newReading={state.newReading}
            selectedPatient={state.selectedPatient}
            setState={setState}
            symptom={symptom}
          />
          <SweetAlert
            type="success"
            show={state.showSuccessReading}
            title="Reading Created!"
            text="Success! You can view the new reading below"
            onConfirm={(): void => setState(
              (currentState: IState): IState => ({ 
                ...currentState, 
                showSuccessReading: false, 
              }))}
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
