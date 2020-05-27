import {
  getLatestReading,
  getLatestReadingDateTime,
  getPrettyDate,
  getTrafficIcon,
  sortPatientsByLastReading,
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

interface IState {
  columns: any;
  data: any;
  selectedPatient: any;
  showReferredPatients: any;
}

export class PatientTable extends React.Component<IProps, IState> {
  state = {
    columns: [
      {
        title: `Patient Initials`,
        field: `patientName`,
        render: (rowData: any) => (
          <p
            key={`initials` + rowData.tableData.id}
            style={{
              fontSize: `200%`,
              fontWeight: `bold`,
              textAlign: `center`,
            }}>
            {rowData.patientName}
          </p>
        ),
        headerStyle: {
          textAlign: `center` as TextAlignProperty,
        },
      },
      {
        title: `Patient ID`,
        field: `patientId`,
        customSort: (left: any, right: any) =>
          Number(left.patientId) - Number(right.patientId),
      },
      { title: `Village`, field: `villageNumber` },
      {
        title: `Vital Sign`,
        cellStyle: {
          padding: `0px`,
        },
        render: (rowData: any) =>
          getTrafficIcon(getLatestReading(rowData.readings).trafficLightStatus),
        customSort: (left: any, right: any) => {
          const leftIndex = trafficLights.indexOf(
            left.readings[0].trafficLightStatus
          );
          const rightIndex = trafficLights.indexOf(
            right.readings[0].trafficLightStatus
          );

          return leftIndex - rightIndex;
        },
      },
      {
        title: `Date of Last Reading`,
        field: `lastReading`,
        render: (rowData: any) => (
          <p>{getPrettyDate(getLatestReadingDateTime(rowData.readings))}</p>
        ),
        customSort: (a: any, b: any) => sortPatientsByLastReading(a, b),
        defaultSort: `asc` as `asc`,
      },
    ],
    data: [],
    selectedPatient: {
      patientId: ``,
      patientName: `Test`,
      patientSex: `F`,
      medicalHistory: ``,
      drugHistory: ``,
      villageNumber: ``,
      readings: [],
    },
    showReferredPatients: false,
  };

  handleSwitchChange(event: any) {
    this.setState({
      showReferredPatients: event.target.checked,
    });
  }

  getPatientsToRender(showReffered: any) {
    return this.props.data.filter((patient: any) => {
      let hasReferral = this.patientHasReferral(patient.readings);
      if (showReffered) {
        return hasReferral;
      } else {
        return !hasReferral;
      }
    });
  }

  patientHasReferral(readings: any) {
    return readings.some((reading: any) => {
      return reading.dateReferred != undefined;
    });
  }

  render() {
    let patientData = this.getPatientsToRender(this.state.showReferredPatients);
    return (
      <MaterialTable
        title="Patients"
        isLoading={this.props.isLoading}
        columns={this.state.columns}
        data={patientData}
        options={{
          pageSize: 10,
          rowStyle: (rowData) => {
            return {
              height: `75px`,
            };
          },
          sorting: true,
        }}
        onRowClick={(e, rowData) => this.props.callbackFromParent(rowData)}
        actions={[
          {
            icon: () => {
              return (
                <Switch
                  onChange={this.handleSwitchChange.bind(this)}
                  color="primary"
                  checked={this.state.showReferredPatients}
                />
              );
            },
            tooltip: `Show referred patients only`,
            isFreeAction: true,
            onClick: () => { return; }
          },
        ]}
      />
    );
  }
}
