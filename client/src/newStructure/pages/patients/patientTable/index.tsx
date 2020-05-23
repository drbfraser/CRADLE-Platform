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
import { trafficLights } from './utils';

interface IProps {
  callbackFromParent: any;
  data: any;
  isLoading: boolean;
}

export const PatientTable: React.FC<IProps> = ({
  callbackFromParent,
  data,
  isLoading
}) => {
  const [showReferredPatients, setShowReferredPatients] = React.useState<
    boolean
  >(false);

  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => setShowReferredPatients(event.target.checked);

  const patientHasReferral = (readings: any): boolean =>
    readings.some((reading: any) => {
      return reading.dateReferred !== undefined;
    });

  const getPatientsToRender = (): any =>
    data.filter((patient: any): boolean => {
      return showReferredPatients && patientHasReferral(patient.readings);
    });

  return (
    <MaterialTable
      title="Patients"
      isLoading={isLoading}
      columns={[
        {
          title: `Patient Initials`,
          field: `patientName`,
          render: (rowData: any) => (
            <p
              key={`initials` + rowData.tableData.id}
              style={{
                fontSize: `200%`,
                fontWeight: `bold`,
                textAlign: `center`
              }}>
              {rowData.patientName}
            </p>
          ),
          headerStyle: {
            textAlign: `center` as TextAlignProperty
          }
        },
        {
          title: `Patient ID`,
          field: `patientId`,
          customSort: (left: any, right: any) =>
            Number(left.patientId) - Number(right.patientId)
        },
        { title: `Village`, field: `villageNumber` },
        {
          title: `Vital Sign`,
          cellStyle: {
            padding: `0px`
          },
          render: (rowData: any) =>
            getTrafficIcon(
              getLatestReading(rowData.readings).trafficLightStatus
            ),
          customSort: (left: any, right: any) => {
            const leftIndex = trafficLights.indexOf(
              left.readings[0].trafficLightStatus
            );
            const rightIndex = trafficLights.indexOf(
              right.readings[0].trafficLightStatus
            );

            return leftIndex - rightIndex;
          }
        },
        {
          title: `Date of Last Reading`,
          field: `lastReading`,
          render: (rowData: any) => (
            <p>{getPrettyDate(getLatestReadingDateTime(rowData.readings))}</p>
          ),
          customSort: (a: any, b: any) => sortPatientsByLastReading(a, b),
          defaultSort: `asc` as `asc`
        }
      ]}
      data={getPatientsToRender()}
      options={{
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75
        }),
        sorting: true
      }}
      onRowClick={(_, rowData) => callbackFromParent(rowData)}
      actions={[
        {
          icon: (): React.ReactElement => (
            <Switch
              onChange={handleSwitchChange}
              color="primary"
              checked={showReferredPatients}
            />
          ),
          tooltip: `Show referred patients only`,
          isFreeAction: true,
          onClick: () => {
            return;
          }
        }
      ]}
    />
  );
};
