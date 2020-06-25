import { GlobalSearchPatient, Patient } from '@types';
import {
  getLatestReadingDateTime,
  getPrettyDate,
  sortPatientsByLastReading,
} from '../../../../../../shared/utils';

import { Column } from 'material-table';
import { PatientStateEnum } from '../../../../../../enums';
import React from 'react';
import Typography from '@material-ui/core/Typography';

export const lastReadingDate: Column<Patient | GlobalSearchPatient> = {
  title: `Date of Last Reading`,
  field: `lastReading`,
  render: (rowData: Patient | GlobalSearchPatient) => (
    <p>{getPrettyDate(getLatestReadingDateTime(rowData.readings))}</p>
  ),
  customSort: (
    patient: Patient | GlobalSearchPatient,
    otherPatient: Patient | GlobalSearchPatient
  ) => sortPatientsByLastReading(patient, otherPatient),
  defaultSort: `asc` as `asc`,
};

export const state: Column<Patient | GlobalSearchPatient> = {
  title: `State`,
  field: `state`,
  render: ({ state }: GlobalSearchPatient) => (
    <Typography variant="body1">
      {`${state === PatientStateEnum.ADD ? `Click row to add` : state}`}
    </Typography>
  ),
  sorting: false,
};
