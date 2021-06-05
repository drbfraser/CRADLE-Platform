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
import useMediaQuery from '@material-ui/core/useMediaQuery';

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

  const isTransformed = useMediaQuery('(min-width:560px)');

  return (
    <tr className={classes.row} onClick={handleClick}>
      <TableCell label="Patient Name" isTransformed={isTransformed}>
        <span style={{ fontSize: '20px' }}>{row.patientName}</span>
      </TableCell>
      <TableCell label="Patient ID" isTransformed={isTransformed}>
        {row.patientId}
        </TableCell>
      <TableCell label="Village" isTransformed={isTransformed}>
        {row.villageNumber}
      </TableCell>
      {/* <td className={classes.cellPadding}>
        <TrafficLight status={row.trafficLightStatus} />
      </td> */}
      <TableCell label="Vital Sign" isTransformed={isTransformed}> </TableCell>
      <TableCell label="Date Referred" isTransformed={isTransformed}>
        {moment(row.dateReferred * 1000).format('YYYY-MM-DD')}
      </TableCell>
      <TableCell label="Assessment" isTransformed={isTransformed}>
        {row.isAssessed ? (
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
  },
  green: {
    color: '#4caf50',
  },
});