import { Callback, Patient } from '@types';

import { MUIDataTableColumn } from 'mui-datatables';
import { useAssessmentColumn } from './column/assessment';
import { useDateReferredColumn } from './column/dateReferred';
import { useInitialsColumn } from './column/initials';
import { usePatientIdColumn } from './column/patientId';
import { useStyles } from '../../../../../shared/components/table/styles';
import { useVillageColumn } from './column/village';
import { useVitalSignColumn } from './column/vitalSign';

// * Order of enums is important
// * Must match order of columns in the table
export enum ReferralTableColumnEnum {
  INITIALS = 'INITIALS',
  PATIENT_ID = 'PATIENT_ID',
  VILLAGE = 'VILLAGE',
  VITAL_SIGN = 'VITAL_SIGN',
  DATE_REFERRED = 'DATE_REFERRED',
  ASSESSMENT = 'ASSESSMENT',
}

interface IArgs {
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

type TableColumns = { [key in ReferralTableColumnEnum]: MUIDataTableColumn };

export const useTableColumns = ({
  patients,
  sortData,
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
  const dateReferredColumn = useDateReferredColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });
  const assessmentColumn = useAssessmentColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    patients,
    sortData,
  });

  const columns: TableColumns = {
    [ReferralTableColumnEnum.INITIALS]: initialsColumn,
    [ReferralTableColumnEnum.PATIENT_ID]: patientIdColumn,
    [ReferralTableColumnEnum.VILLAGE]: villageColumn,
    [ReferralTableColumnEnum.VITAL_SIGN]: vitalSignColumn,
    [ReferralTableColumnEnum.DATE_REFERRED]: dateReferredColumn,
    [ReferralTableColumnEnum.ASSESSMENT]: assessmentColumn,
  };

  return Object.values(columns);
};
