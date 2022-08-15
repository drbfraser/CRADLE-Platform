import { BREAKPOINT, COLUMNS } from './constants';

import { IPatient } from './types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';

interface IProps {
  row: IPatient;
}

export const PatientRow = ({ row }: IProps) => {
  const classes = useRowStyles();
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
        <TrafficLight
          status={
            row.trafficLightStatus
              ? row.trafficLightStatus
              : TrafficLightEnum.NONE
          }
        />
      </TableCell>
      <TableCell label={COLUMNS.dateTimeTaken} isTransformed={isTransformed}>
        {!row.dateTimeTaken
          ? 'No reading'
          : moment(row.dateTimeTaken * 1000).format('YYYY-MM-DD')}
      </TableCell>
    </tr>
  );
};
