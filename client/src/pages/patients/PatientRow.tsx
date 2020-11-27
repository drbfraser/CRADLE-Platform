import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRowStyles } from '../../../src/shared/components/apiTable/rowStyles';
import { TrafficLight } from '../../../src/shared/components/trafficLight';
import { IPatient } from './types';

interface IProps {
  row: IPatient;
}

export const PatientRow = ({ row }: IProps) => {
  const classes = useRowStyles();
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
      <td>
        {row.dateTimeTaken === null
          ? 'No reading'
          : moment(row.dateTimeTaken * 1000).format('YYYY-MM-DD')}
      </td>
    </tr>
  );
};
