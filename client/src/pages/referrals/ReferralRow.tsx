import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TrafficLight } from '../../../src/shared/components/trafficLight';
import { IReferral } from './types';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useRowStyles } from '../../../src/shared/components/apiTable/rowStyles';

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

  return (
    <tr className={classes.row} onClick={handleClick}>
      <td>
        <span style={{ fontSize: '30px' }}>{row.patientName}</span>
      </td>
      <td>{row.patientId}</td>
      <td>{row.villageNumber}</td>
      <td className={classes.cellPadding}>
        <TrafficLight status={row.trafficLightStatus} />
      </td>
      <td>{moment(row.dateReferred * 1000).format('YYYY-MM-DD')}</td>
      <td>
        {row.isAssessed ? (
          <>
            <DoneIcon className={classesIcon.green} /> Complete
          </>
        ) : (
          <>
            <ScheduleIcon className={classesIcon.red} /> Pending
          </>
        )}
      </td>
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
