import {
  getLatestReading,
  getLatestReadingDateTime,
  getPrettyDate,
  getTrafficIcon,
  sortPatientsByLastReading
} from '../../../shared/utils';

import MaterialTable from 'material-table';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import { TextAlignProperty } from 'csstype';
import { TrafficLightEnum } from '../../../enums';
import { Patient, Reading } from "../../../types";

interface IProps {
  callbackFromParent: any;
  data: Array<Patient>;
  isLoading: boolean;
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
        {
          title: `Patient Initials`,
          field: `patientName`,
          render: (rowData: Patient): JSX.Element => (
            <p
              style={ {
                fontSize: `200%`,
                fontWeight: `bold`,
                textAlign: `center`
              } }>
              { rowData.patientName }
            </p>
          ),
          headerStyle: {
            textAlign: `center` as TextAlignProperty
          }
        },
        {
          title: `Patient ID`,
          field: `patientId`,
          customSort: (patient: Patient, otherPatient: Patient) =>
            Number(patient.patientId) - Number(otherPatient.patientId)
        },
        { title: `Village`, field: `villageNumber` },
        {
          title: `Vital Sign`,
          cellStyle: {
            padding: `0px`
          },
          render: (rowData: Patient) =>
            getTrafficIcon(
              getLatestReading(rowData.readings).trafficLightStatus
            ),
          customSort: (patient: Patient, otherPatient: Patient) => {
            const leftIndex = Object.values(TrafficLightEnum).indexOf(
              patient.readings[0].trafficLightStatus
            );
            const rightIndex = Object.values(TrafficLightEnum).indexOf(
              otherPatient.readings[0].trafficLightStatus
            );

            return leftIndex - rightIndex;
          }
        },
        {
          title: `Date of Last Reading`,
          field: `lastReading`,
          render: (rowData: Patient) => (
            <p>{ getPrettyDate(getLatestReadingDateTime(rowData.readings)) }</p>
          ),
          customSort: (patient: Patient, otherPatient: Patient) =>
            sortPatientsByLastReading(patient, otherPatient),
          defaultSort: `asc` as `asc`
        }
      ] }
      data={patients}
      options={ {
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75
        }),
        sorting: true
      } }
      onRowClick={ (_, rowData) => callbackFromParent(rowData) }
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
