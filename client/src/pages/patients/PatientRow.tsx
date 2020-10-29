import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TrafficLight } from '../../../src/shared/components/trafficLight';
import { IPatient } from './types';

interface IProps {
  patient: IPatient;
}

export const PatientRow = ({ patient }: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const handleClick = () => {
    history.push('/patients/' + patient.patientId);
  };

  return (
    <tr className={classes.row} onClick={handleClick}>
      <td>
        <span style={{ fontSize: '30px' }}>{patient.patientName}</span>
      </td>
      <td>{patient.patientId}</td>
      <td>{patient.villageNumber}</td>
      <td className={classes.cellPadding}>
        <TrafficLight status={patient.trafficLightStatus} />
      </td>
      <td>{moment(patient.dateTimeTaken * 1000).format('YYYY-MM-DD')}</td>
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
});
