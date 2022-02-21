import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { IReferral } from './types';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { COLUMNS, BREAKPOINT } from './constants';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface IProps {
  row: IReferral;
}

export const ReferralRow = ({ row }: IProps) => {
  console.log(row);
  const classes = useRowStyles();
  const classesIcon = useStyles();
  const history = useHistory();

  const handleClick = () => {
    history.push('/patients/' + row.patientId);
  };

  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <tr className={classes.row} onClick={handleClick}>
      <TableCell label={COLUMNS.patientName} isTransformed={isTransformed}>
        <span style={{ fontSize: '18px' }}>{row.patientName}</span>
      </TableCell>
      <TableCell label={COLUMNS.patientId} isTransformed={isTransformed}>
        {row.patientId}
      </TableCell>
      <TableCell label={COLUMNS.villageNumber} isTransformed={isTransformed}>
        {row.villageNumber}
      </TableCell>
      <TableCell
        label={COLUMNS.trafficLightStatus}
        isTransformed={isTransformed}>
        <TrafficLight status={row.vitalSign} />
      </TableCell>
      <TableCell label={COLUMNS.dateReferred} isTransformed={isTransformed}>
        {moment(row.dateReferred * 1000).format('YYYY-MM-DD')}
      </TableCell>
      <TableCell label={COLUMNS.isAssessed} isTransformed={isTransformed}>
        {(row.isAssessed||row.notAttended||row.isCancelled) ? (
          <>
            <DoneIcon className={classesIcon.green} /> Complete
          </>
        ) : (
          <>
            <ScheduleIcon className={classesIcon.red} /> Pending
          </>
        )}
      </TableCell>
    </tr>
  );
};

const useStyles = makeStyles({
  red: {
    color: '#f44336',
    padding: '2px',
  },
  green: {
    color: '#4caf50',
    padding: '2px',
  },
});
