import React from 'react';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getPrettyDateTime } from 'src/shared/utils';
import { MedicalRecord } from 'src/shared/types';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Typography } from '@material-ui/core';
import { MEDICAL_RECORD_COLUMNS } from './constants';

interface IProps {
  row: MedicalRecord;
}

export const MedicalRecordRow = ({ row }: IProps) => {
  const classes = useRowStyles();
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <tr className={classes.row}>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.dateCreated}
        isTransformed={isTransformed}>
        {getPrettyDateTime(row.dateCreated)}
      </TableCell>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.information}
        isTransformed={isTransformed}>
        <Typography style={{ whiteSpace: 'pre-line' }}>
          {row.information ? row.information : 'No information'}
        </Typography>
      </TableCell>
    </tr>
  );
};
