import MaterialTable from 'material-table';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import { Patient, Reading, Callback } from "../../../types";
import { initials, patientId, village, vitalSign, lastReadingDate } from "./utils";

interface IProps {
  data: Array<Patient>;
  isLoading: boolean;
  callbackFromParent: Callback<Patient>;
}

export const PatientTable: React.FC<IProps> = ({
  callbackFromParent,
  data,
  isLoading
}) => {
  const [showReferredPatientsOnly, setShowReferredPatientsOnly] = React.useState<
    boolean
  >(false);
  const patients = React.useMemo((): Array<Patient> => 
    data.filter(({ readings }: Patient): boolean => showReferredPatientsOnly 
      ? readings.some((reading: Reading): boolean => reading.dateReferred !== undefined)
      : true
    ), 
    [data, showReferredPatientsOnly]
  );

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
      actions={ [
        {
          icon: (): React.ReactElement => (
            <Switch
              color="primary"
              checked={ showReferredPatientsOnly }
            />
          ),
          tooltip: `Show referred patients only`,
          isFreeAction: true,
          onClick: (): void => 
            setShowReferredPatientsOnly((showing: boolean): boolean => !showing)
        }
      ] }
    />
  );
};
