import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TrafficLight } from '../../../src/shared/components/trafficLight';
import { IReferral } from './types';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';

interface IProps {
  referral: IReferral;
}

export const ReferralRow = ({ referral }: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const handleClick = () => {
    history.push('/patients/' + referral.patientId);
  };

  return (
    <tr className={classes.row} onClick={handleClick}>
      <td>
        <span style={{ fontSize: '30px' }}>{referral.patientName}</span>
      </td>
      <td>{referral.patientId}</td>
      <td>{referral.villageNumber}</td>
      <td className={classes.cellPadding}>
        <TrafficLight status={referral.trafficLightStatus} />
      </td>
      <td>{moment(referral.dateReferred * 1000).format('YYYY-MM-DD')}</td>
      <td>
        {referral.isAssessed ? (
          <>
            <DoneIcon className={classes.green} /> Complete
          </>
        ) : (
          <>
            <ScheduleIcon className={classes.red} /> Pending
          </>
        )}
      </td>
    </tr>
  );
};

const useStyles = makeStyles({
  row: {
    cursor: 'pointer',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
  },
  cellPadding: {
    padding: '5px 0',
  },
  red: {
    color: '#f44336',
  },
  green: {
    color: '#4caf50',
  },
});
