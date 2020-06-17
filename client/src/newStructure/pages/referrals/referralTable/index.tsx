import React, { Component } from 'react';
import {
  getLatestReading,
  getPrettyDate,
  getTrafficIcon,
} from '../../../shared/utils';
import { getLatestReferral, sortReferralsByDate } from './utils';

import { Icon } from 'semantic-ui-react';
import MaterialTable from 'material-table';
interface IProps {
  callbackFromParent: any;
  data: any;
  isLoading: boolean;
}

interface IState {
  columns: any;
  data: any;
  selectedPatient: any;
}
export class ReferralTable extends Component<IProps, IState> {
  state = {
    columns: [
      {
        title: 'Patient Initials',
        field: 'patientName',
        render: (rowData: any) => (
          <p
            key={'initials' + rowData.tableData.id}
            style={{
              fontSize: '200%',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            {rowData.patientName}
          </p>
        ),
        headerStyle: {
          textAlign: 'center',
        },
        sorting: false,
      },
      { title: 'Patient ID', field: 'patientId' },
      { title: 'Village', field: 'villageNumber' },
      {
        title: 'Vital Sign',
        cellStyle: {
          padding: '0px',
        },
        sorting: false,
        render: (rowData: any) =>
          getTrafficIcon(getLatestReading(rowData.readings).trafficLightStatus),
      },
      {
        title: 'Date Referred',
        render: (rowData: any) => (
          <p>{getPrettyDate(getLatestReferral(rowData.readings))}</p>
        ),
        customSort: (a: any, b: any) => sortReferralsByDate(a, b),
        defaultSort: 'asc',
      },
      {
        title: 'Assessment',
        render: (rowData: any) =>
          rowData.needsAssessment ? (
            <p>
              <Icon name="clock outline" size="large" color="red" /> Pending
            </p>
          ) : (
            <p>
              <Icon name="checkmark" size="large" color="green" /> Complete
            </p>
          ),
      },
    ],
    data: [],
    selectedPatient: {
      patientId: '',
      patientName: 'Test',
      patientSex: 'F',
      medicalHistory: '',
      drugHistory: '',
      villageNumber: '',
      readings: [],
    },
  };

  render() {
    return (
      <MaterialTable
        title="Referrals"
        isLoading={this.props.isLoading}
        columns={this.state.columns as any}
        data={this.props.data}
        options={{
          pageSize: 10,
          rowStyle: (rowDat: any) => {
            return {
              height: '75px',
            };
          },
          searchFieldVariant: `outlined`,
          searchFieldStyle: { marginBlockStart: `1rem` },
        }}
        onRowClick={(e, rowData) => this.props.callbackFromParent(rowData)}
      />
    );
  }
}
