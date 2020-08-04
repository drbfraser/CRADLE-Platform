import { OrNull, OrUndefined, Patient } from '@types';
import { actionCreators, initialState, reducer } from './reducers';
import {
  addPatientToHealthFacility,
  resetAddedFromGlobalSearch,
  updateSelectedPatientState,
} from '../../../redux/reducers/patients';
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
import { ReduxState } from '../../../redux/reducers';
import { Toast } from '../../../shared/components/toast';
import { VitalsOverTime } from './vitalsOverTime';
import { push } from 'connected-react-router';

interface IProps {
  selectedPatient: Patient;
}

type SelectorState = {
  addedFromGlobalSearch: boolean;
  addingFromGlobalSearch: boolean;
  addingFromGlobalSearchError: OrNull<string>;
  selectedPatientState: OrUndefined<PatientStateEnum>;
};

export const PatientSummary: React.FC<IProps> = ({ selectedPatient }) => {
  const {
    addedFromGlobalSearch,
    addingFromGlobalSearch,
    addingFromGlobalSearchError,
    selectedPatientState,
  } = useSelector(
    ({ patients }: ReduxState): SelectorState => {
      return {
        addedFromGlobalSearch: patients.addedFromGlobalSearch,
        addingFromGlobalSearch: patients.addingFromGlobalSearch,
        addingFromGlobalSearchError: patients.addingFromGlobalSearchError,
        selectedPatientState: patients.selectedPatientState,
      };
    }
  );

  const [state, updateState] = React.useReducer(reducer, initialState);

  const [action, setAction] = React.useState<OrNull<() => void>>(null);

  const dispatch = useDispatch();

  // * Handles closing the prompt
  const hidePrompt = React.useCallback((): void => {
    updateState(actionCreators.hidePrompt());
  }, []);

  // * Handles confirming that the patient has been added to the health facility
  // * before proceeding with the action
  const onAddPatientRequired = (
    actionAfterAdding: () => void,
    message: string
  ): void => {
    if (selectedPatientState === PatientStateEnum.ADD) {
      updateState(
        actionCreators.showPrompt({
          message,
          onPromptConfirmed: (): void => {
            dispatch(updateSelectedPatientState(undefined));
            dispatch(addPatientToHealthFacility(selectedPatient.patientId));
            setAction((): (() => void) => actionAfterAdding);
          },
        })
      );
    } else {
      actionAfterAdding();
    }
  };

  React.useEffect((): void => {
    if (addedFromGlobalSearch) {
      hidePrompt();
      // * Delay performing the action for better UI experience
      setTimeout(() => {
        action?.();
        setAction(null);
        dispatch(resetAddedFromGlobalSearch());
      }, 500);
    }
  }, [action, addedFromGlobalSearch, dispatch, hidePrompt]);

  const openReadingModal = (): void => {
    onAddPatientRequired(() => {
      dispatch(push(`/readings/new`, { patient: selectedPatient }));
    }, `You haven't added this patient to your health facility. You need to do that before you can add a reading. Would like to add this patient?`);
  };

  const clearError = (): void => {
    dispatch(resetAddedFromGlobalSearch());
  };

  return (
    <>
      <Toast
        status="error"
        message={addingFromGlobalSearchError}
        clearMessage={clearError}
      />
      <AddPatientPrompt
        adding={addingFromGlobalSearch}
        addPatient={state.onPromptConfirmed}
        closeDialog={hidePrompt}
        show={state.showPrompt}
        message={state.promptMessage}
        positiveText="Add"
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
