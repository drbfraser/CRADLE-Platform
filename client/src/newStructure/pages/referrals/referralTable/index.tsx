import React, { Component } from 'react';
import { assessment, dateReferred } from './utils';
import {
  initials,
  patientId,
  village,
  vitalSign,
} from '../../../shared/components/table/columns';

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
      initials,
      patientId,
      village,
      vitalSign,
      dateReferred,
      assessment,
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

  render(): JSX.Element {
    return (
      <MaterialTable
        title="Referrals"
        isLoading={this.props.isLoading}
        columns={this.state.columns as any}
        data={this.props.data}
        options={{
          pageSize: 10,
          rowStyle: () => {
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
