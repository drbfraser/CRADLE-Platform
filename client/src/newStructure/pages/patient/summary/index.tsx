import { OrUndefined, Patient } from '@types';
import { actionCreators, initialState, reducer } from './reducers';
import {
  addPatientToHealthFacility,
  updateSelectedPatientState,
} from '../../../shared/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { AddPatientPrompt } from '../../../shared/components/addPatientPrompt';
import { Divider } from 'semantic-ui-react';
import Grid from '@material-ui/core/Grid';
import { MedicalInformation } from './medicalInformation';
import { PageHeader } from './header';
import { PatientReadings } from './readings';
import { PatientStateEnum } from '../../../enums';
import React from 'react';
import { ReadingModal } from './readingModal';
import { ReduxState } from '../../../redux/rootReducer';
import { VitalsOverTime } from './vitalsOverTime';

interface IProps {
  selectedPatient: Patient;
}

export const PatientSummary: React.FC<IProps> = ({ selectedPatient }) => {
  const selectedPatientState = useSelector(
    (state: ReduxState): OrUndefined<PatientStateEnum> => {
      return state.patients.selectedPatientState;
    }
  );

  const [state, updateState] = React.useReducer(reducer, initialState);

  const [oldState] = React.useState({
    actionAfterAdding: (): void => {
      return;
    },
    promptMessage: ``,
    showPrompt: false,
  });

  const dispatch = useDispatch();

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

  return (
    <>
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
            patientId={selectedPatient.patientId}
            showingVitals={state.showVitals}
            showingTrafficLights={state.showTrafficLights}
            updateState={updateState}
          />
        </Grid>
        <PatientReadings
          assessment={state.assessment}
          displayAssessmentModal={state.displayAssessmentModal}
          selectedPatient={selectedPatient}
          onAddPatientRequired={onAddPatientRequired}
          updateState={updateState}
        />
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
    </>
  );
};
