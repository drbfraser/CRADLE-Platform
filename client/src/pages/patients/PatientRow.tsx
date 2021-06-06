import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { IPatient } from './types';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface IProps {
  row: IPatient;
}

export const PatientRow = ({ row }: IProps) => {
  const classes = useRowStyles();
  const history = useHistory();

  const handleClick = () => {
    history.push('/patients/' + row.patientId);
  };

  const isTransformed = useMediaQuery('(min-width:530px)');

  return (
    <tr className={classes.row} onClick={handleClick}>
      <TableCell label="Patient Name" isTransformed={isTransformed}>
        <span style={{ fontSize: '18px' }}>{row.patientName}</span>
      </TableCell>
      <TableCell label="Patient ID" isTransformed={isTransformed}>
        {row.patientId}
      </TableCell>
      <TableCell label="Village" isTransformed={isTransformed}>
        {row.villageNumber}
      </TableCell>
      <TableCell label="Vital Sign" isTransformed={isTransformed}>
        <TrafficLight status={row.trafficLightStatus} />
      </TableCell>
      <TableCell label="Last Reading Date" isTransformed={isTransformed}>
        {row.dateTimeTaken === null
          ? 'No reading'
          : moment(row.dateTimeTaken * 1000).format('YYYY-MM-DD')}
      </TableCell>
    </tr>
  );
};
