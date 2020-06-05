import { Callback, OrNull, Patient, Reading } from '@types';
import { initials, lastReadingDate, patientId, village, vitalSign } from './utils';

import MaterialTable from 'material-table';
import React from 'react';
import { useActions } from './hooks/actions';

interface IProps {
  data: OrNull<Array<Patient>>;
  isLoading: boolean;
  callbackFromParent: Callback<Patient>;
  showGlobalSearch?: boolean; 
}

export const PatientTable: React.FC<IProps> = ({
  callbackFromParent,
  data,
  isLoading,
  showGlobalSearch,
}) => {
  const [globalSearch, setGlobalSearch] = React.useState(false);
  const [showReferredPatients, setShowReferredPatients] = React.useState<
    boolean
  >(false);
  const patients = React.useMemo((): Array<Patient> => 
    data ? data.filter(({ readings }: Patient): boolean => showReferredPatients 
      ? readings.some((reading: Reading): boolean => Boolean(reading.dateReferred))
      : true
    ) : [], 
    [data, showReferredPatients]
  );
  const actions = useActions({
    showReferredPatients,
    toggleGlobalSearch: setGlobalSearch,
    toggleShowReferredPatients: setShowReferredPatients,
    usingGlobalSearch: globalSearch,
    showGlobalSearchAction: showGlobalSearch,
  });

  return (
    <MaterialTable
      title="Patients"
      isLoading={ isLoading }
      columns={ [
        initials,
        patientId,
        village,
        vitalSign,
        lastReadingDate,
      ] }
      data={patients}
      options={ {
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75
        }),
        sorting: true
      } }
      onRowClick={ (_, rowData: Patient) => callbackFromParent(rowData) }
      actions={actions}
    />
  );
};
