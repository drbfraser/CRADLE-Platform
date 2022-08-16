import { BREAKPOINT, COLUMNS } from './constants';

import DoneIcon from '@mui/icons-material/Done';
import { IReferral } from './types';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { TrafficLight } from 'src/shared/components/trafficLight';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';

interface IProps {
  row: IReferral;
}

export const ReferralRow = ({ row }: IProps) => {
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
        {row.isAssessed || row.notAttended || row.isCancelled ? (
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
