import { Callback, GlobalSearchPatient, Patient } from '@types';

import { MUIDataTableColumn } from 'mui-datatables';
import React from 'react';
import { useInitialsColumn } from './column/initials';
import { useLastReadingDateColumn } from './column/lastReadingDate';
import { usePatientIdColumn } from './column/patientId';
import { useStyles } from '../../../../../shared/components/table/styles';
import { useTakeActionColumn } from './column/takeAction';
import { useVillageColumn } from './column/village';
import { useVitalSignColumn } from './column/vitalSign';

// * Order of enums is important
// * Must match order of columns in the table
// * Necessary for the Take Action column
// * Requires the right index
export enum PatientTableColumnEnum {
  INITIALS = 'INITIALS',
  PATIENT_ID = 'PATIENT_ID',
  VILLAGE = 'VILLAGE',
  VITAL_SIGN = 'VITAL_SIGN',
  LAST_READING_DATE = 'LAST_READING_DATE',
  TAKE_ACTION = 'TAKE_ACTION',
}

interface IArgs {
  globalSearch: boolean;
  onGlobalSearchPatientSelected: Callback<string>;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient>>;
}

type TableColumns = { [key in PatientTableColumnEnum]: MUIDataTableColumn };

export const useTableColumns = ({
  globalSearch,
  patients,
  sortData,
  onGlobalSearchPatientSelected,
}: IArgs): Array<MUIDataTableColumn> => {
  const classes = useStyles();

  const initialsColumn = useInitialsColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const patientIdColumn = usePatientIdColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const villageColumn = useVillageColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const vitalSignColumn = useVitalSignColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const lastReadingDateColumn = useLastReadingDateColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const takeActionColumn = useTakeActionColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    onGlobalSearchPatientSelected,
  });

  const columns: TableColumns = {
    [PatientTableColumnEnum.INITIALS]: initialsColumn,
    [PatientTableColumnEnum.PATIENT_ID]: patientIdColumn,
    [PatientTableColumnEnum.VILLAGE]: villageColumn,
    [PatientTableColumnEnum.VITAL_SIGN]: vitalSignColumn,
    [PatientTableColumnEnum.LAST_READING_DATE]: lastReadingDateColumn,
    [PatientTableColumnEnum.TAKE_ACTION]: takeActionColumn,
  };

  return React.useMemo((): Array<MUIDataTableColumn> => {
    if (globalSearch) {
      return Object.values(columns);
    }

    return Object.values(columns).filter(
      ({ label }: MUIDataTableColumn): boolean => {
        return label !== columns[PatientTableColumnEnum.TAKE_ACTION].label;
      }
    );
  }, [columns, globalSearch]);
};
