import { BREAKPOINT, COLUMNS } from './constants';

import { IPatient } from './types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ApiTableRow } from 'src/shared/components/apiTable/ApiTableRow';
import { Box } from '@mui/material';

interface IProps {
  row: IPatient;
}

export const PatientRow = ({ row }: IProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patients/${row.id}`);
  };

  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <ApiTableRow onClick={handleClick}>
      <TableCell label={COLUMNS.name} isTransformed={isTransformed}>
        <Box component="span" sx={{ fontSize: '18px' }}>
          {row.name}
        </Box>
      </TableCell>
      <TableCell label={COLUMNS.patientId} isTransformed={isTransformed}>
        {row.id}
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
        {!row.dateTaken
          ? 'No reading'
          : moment(row.dateTaken * 1000).format('YYYY-MM-DD')}
      </TableCell>
    </ApiTableRow>
  );
};
