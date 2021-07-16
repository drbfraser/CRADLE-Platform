import React from 'react';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getPrettyDateTime } from 'src/shared/utils';
import { MedicalRecord } from 'src/shared/types';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Typography, IconButton } from '@material-ui/core';
import { MEDICAL_RECORD_COLUMNS } from './constants';
import DeleteForever from '@material-ui/icons/DeleteForever';

interface IProps {
  row: MedicalRecord;
  setDeletePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupRecord: React.Dispatch<React.SetStateAction<any>>;
}

export const MedicalRecordRow = ({
  row,
  setDeletePopupOpen,
  setPopupRecord,
}: IProps) => {
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
        <Typography
          style={{
            whiteSpace: 'pre-line',
            display: 'inline-block',
            textAlign: 'left',
          }}>
          {row.information ? row.information : 'No information'}
        </Typography>
      </TableCell>
      <TableCell
        label={MEDICAL_RECORD_COLUMNS.action}
        isTransformed={isTransformed}>
        <IconButton
          onClick={() => {
            setDeletePopupOpen(true);
            setPopupRecord(row);
          }}>
          <DeleteForever />
        </IconButton>
      </TableCell>
    </tr>
  );
};
