import { OrNull, Patient } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { Loader } from '../../../components/loader';
import { PatientSummary } from '..';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { RouteComponentProps } from 'react-router-dom';
import { getPatient } from '../../../reducers/patients';
import { goBack } from 'connected-react-router';

type SelectorState = {
  loading: boolean;
  patient: OrNull<Patient>;
};

type Params = {
  id: string;
};

export const PatientSummaryContainer: React.FC<RouteComponentProps<Params>> = ({
  match: {
    params: { id },
  },
}) => {
  const { loading, patient } = useSelector(
    ({ patients }: ReduxState): SelectorState => {
      return {
        loading: patients.isLoading,
        patient: patients.patient,
      };
    }
  );
  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (id) {
      dispatch(getPatient(id));
    }
  }, [dispatch, id]);

  const goBackToPreviousPage = () => {
    dispatch(goBack());
  };

  if (loading) {
    return <Loader message="Fetching the patient..." show={true} />;
  }

  return (
    <PatientSummary
      callbackFromParent={goBackToPreviousPage}
      selectedPatient={patient}
    />
  );
};
