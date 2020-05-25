import React from 'react';
import { getReferralIds } from './utils';
import { IState } from '../../utils';

interface IArgs {
  props: any;
  setState: React.Dispatch<React.SetStateAction<IState>>;
}

export const useSetup = ({ props, setState }: IArgs): void => {
  React.useEffect((): void => {
    setState((currentState: IState): IState => ({ ...currentState, selectedPatient: props.selectedPatient }));

    props.getReferrals(getReferralIds(props.selectedPatient));
    if (props.selectedPatient) {
      props.getSelectedPatientStatistics(
        props.selectedPatient.patientId
      );
    }
  }, [
    props.getReferrals, 
    props.getSelectedPatientStatistics, 
    props.selectedPatient, 
    setState
  ]);
};