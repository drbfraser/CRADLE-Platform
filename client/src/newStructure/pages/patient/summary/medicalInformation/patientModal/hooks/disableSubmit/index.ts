import { EditedPatient } from '@types';
import React from 'react';
import { SexEnum } from '../../../../../../../enums';

interface IArgs {
  loading: boolean;
  editedPatient: EditedPatient;
}

export const useDisableSubmit = ({
  loading,
  editedPatient,
}: IArgs): boolean => {
  return React.useMemo((): boolean => {
    return (
      loading ||
      !editedPatient.patientName ||
      !editedPatient.patientSex ||
      (editedPatient.patientSex === SexEnum.FEMALE &&
        (!editedPatient.gestationalAgeValue ||
          !editedPatient.gestationalAgeUnit))
    );
  }, [loading, editedPatient]);
};
