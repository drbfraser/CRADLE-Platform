import React from 'react';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getPrettyDateTime } from 'src/shared/utils';
import { Pregnancy } from 'src/shared/types';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Typography, IconButton } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { PREGNANCY_RECORD_COLUMNS } from './constants';

interface IProps {
  row: Pregnancy;
  unit: GestationalAgeUnitEnum;
  patientId: string;
  history: any;
}

export const PregnancyRecordRow = ({
  row,
  unit,
  patientId,
  history,
}: IProps) => {
  const classes = useRowStyles();
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <tr className={classes.row}>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.startDate}
        isTransformed={isTransformed}>
        {getPrettyDateTime(row.startDate)}
      </TableCell>
      <TableCell
        label={PREGNANCY_RECORD_COLUMNS.endDate}
        isTransformed={isTransformed}>
        {row.endDate ? getPrettyDateTime(row.endDate) : 'Ongoing'}
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
        label={PREGNANCY_RECORD_COLUMNS.edit}
        isTransformed={isTransformed}>
        <IconButton
          onClick={() => {
            history.push(
              `/patients/${patientId}/edit/pregnancyInfo/${row.pregnancyId}`
            );
          }}>
          <CreateIcon />
        </IconButton>
      </TableCell>
    </tr>
  );
};
