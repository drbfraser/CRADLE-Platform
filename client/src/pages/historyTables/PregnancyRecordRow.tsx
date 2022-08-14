import React from 'react';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getPrettyDate } from 'src/shared/utils';
import { Pregnancy } from 'src/shared/types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Typography, IconButton } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { PREGNANCY_RECORD_COLUMNS } from './constants';

interface IProps {
  row: Pregnancy;
  unit: GestationalAgeUnitEnum;
  patientId: string;
  history: any;
  setDeletePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupRecord: React.Dispatch<React.SetStateAction<any>>;
}

export const PregnancyRecordRow = ({
  row,
  unit,
  patientId,
  history,
  setDeletePopupOpen,
  setPopupRecord,
}: IProps) => {
  const classes = useRowStyles();
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <tr className={classes.row}>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.startDate}
        isTransformed={isTransformed}>
        {getPrettyDate(row.startDate)}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.endDate}
        isTransformed={isTransformed}>
        {row.endDate ? getPrettyDate(row.endDate) : 'Ongoing'}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.gestation}
        isTransformed={isTransformed}>
        {gestationalAgeUnitFormatters[unit ?? GestationalAgeUnitEnum.WEEKS](
          row.startDate,
          row.endDate
        )}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.outcome}
        isTransformed={isTransformed}>
        <Typography
          style={{
            whiteSpace: 'pre-line',
            display: 'inline-block',
            textAlign: 'left',
          }}>
          {row.outcome ? row.outcome : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.action}
        isTransformed={isTransformed}>
        <IconButton
          onClick={() => {
            history.push(
              `/patients/${patientId}/edit/pregnancyInfo/${row.pregnancyId}`
            );
          }}
          size="large">
          <CreateIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            setDeletePopupOpen(true);
            setPopupRecord(row);
          }}
          size="large">
          <DeleteForever />
        </IconButton>
      </TableCell>
    </tr>
  );
};
