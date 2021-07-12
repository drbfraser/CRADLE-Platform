import React from 'react';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getYearToDisplay } from 'src/shared/utils';
import { PastPregnancy } from 'src/shared/types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Typography } from '@material-ui/core';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { COLUMNS } from './constants';

interface IProps {
  row: PastPregnancy;
  unit: GestationalAgeUnitEnum;
  patientId: string;
  history: any;
}

export const PregnancyRow = ({ row, unit, patientId, history }: IProps) => {
  const classes = useRowStyles();
  const isTransformed = useMediaQuery(`(min-width:600px)`);

  const handleClick = () => {
    history.push('/patients/' + patientId);
  };

  return (
    <tr className={classes.row} onClick={handleClick}>
      <TableCell label={COLUMNS.endDate} isTransformed={isTransformed}>
        {getYearToDisplay(row.pregnancyEndDate)}
      </TableCell>
      <TableCell label={COLUMNS.gestation} isTransformed={isTransformed}>
        {gestationalAgeUnitFormatters[unit ?? GestationalAgeUnitEnum.WEEKS](
          row.pregnancyStartDate,
          row.pregnancyEndDate
        )}
      </TableCell>
      <TableCell label={COLUMNS.outcome} isTransformed={isTransformed}>
        <Typography
          style={{
            whiteSpace: 'pre-line',
            display: 'inline-block',
            textAlign: 'left',
          }}>
          {row.pregnancyOutcome ? row.pregnancyOutcome : 'N/A'}
        </Typography>
      </TableCell>
    </tr>
  );
};
