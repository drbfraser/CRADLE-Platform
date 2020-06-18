import { Patient, Reading } from '@types';
import { getMomentDate, getPrettyDate } from '../../../../shared/utils';

import { Column } from 'material-table';
import { Icon } from 'semantic-ui-react';
import React from 'react';

const getLatestReferral = (readings: Array<Reading>): number | string => {
  let sortedReadings = readings.sort((a: Reading, b: Reading): number => {
    return (
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
    );
  });

  return sortedReadings[0].dateReferred ?? ``;
};

export const dateReferred: Column<Patient> = {
  title: `Date Referred`,
  render: (rowData: Patient) => (
    <p>{getPrettyDate(getLatestReferral(rowData.readings))}</p>
  ),
  customSort: (a: Patient, b: Patient): number => {
    return (
      getMomentDate(getLatestReferral(b.readings)).valueOf() -
      getMomentDate(getLatestReferral(a.readings)).valueOf()
    );
  },
  defaultSort: `asc`,
};

enum SortEnum {
  A_BEFORE_B = -1,
  B_BEFORE_A = 1,
  EQUAL = 0,
}

export const assessment: Column<Patient> = {
  title: `Assessment`,
  customSort: (a: Patient, b: Patient): number => {
    if (a.needsAssessment) {
      return SortEnum.A_BEFORE_B;
    }

    if (b.needsAssessment) {
      return SortEnum.B_BEFORE_A;
    }

    return SortEnum.EQUAL;
  },
  render: (rowData: Patient) =>
    rowData.needsAssessment ? (
      <p>
        <Icon name="clock outline" size="large" color="red" /> Pending
      </p>
    ) : (
      <p>
        <Icon name="checkmark" size="large" color="green" /> Complete
      </p>
    ),
};
