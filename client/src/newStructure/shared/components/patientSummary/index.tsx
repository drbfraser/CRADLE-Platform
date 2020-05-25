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
import { createReading, sortReadings, initialState, IState } from './utils';
import { newReadingPost } from '../../reducers/newReadingStatus';
import { NoPatientSelected } from './noPatientSelected';
import { Title } from './title';
import { AddNewReading } from './addNewReading';
import { Readings } from './readings';
import { PatientModal } from './modal/patient';
import { NewPatientModal } from "./modal/newPatient";
import { SummaryGrid } from "./grid";
import { useSetup } from "./hooks/setup";
import { useReset } from "./hooks/reset";

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
  useSetup({ props, setState });
  useReset({ newReadingPost: props.newReadingPost, state, setState });

  const goBackToPatientsPage = (): void => {
    // go back to patient table
    props.getPatients();
    props.callbackFromParent(false);
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
            hasUrineTest={state.hasUrineTest}
            newReading={state.newReading}
            selectedPatient={state.selectedPatient}
            setState={setState}
            symptom={symptom}
            user={props.user}
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
