import React from 'react';
import { IState } from '../../utils';
import { calculateShockIndex } from './utils';

interface IArgs {
  newReadingPost: any;
  state: IState;
  setState: React.Dispatch<React.SetStateAction<IState>>;
}

export const useReset = ({ newReadingPost, state, setState }: IArgs): void => {
  React.useEffect((): void => {
    if (state.reset) {
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
      newReadingPost(newData);

      newData['reading']['trafficLightStatus'] = calculateShockIndex(
        newData['reading']
      );
      setState((currentState: IState): IState => ({
        ...currentState,
        selectedPatient: {
          ...state.selectedPatient,
          readings: [
            ...state.selectedPatient.readings,
            newData['reading'],
          ],
        },
        showSuccessReading: true,
        hasUrineTest: false,
        reset: false,
      }));

      setState((currentState: IState): IState => ({
        ...currentState,
        displayReadingModal: false
      }));
    }
  }, [newReadingPost, state, setState]);
};