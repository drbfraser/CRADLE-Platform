import { BREAKPOINT, COLUMNS } from './constants';

import DoneIcon from '@mui/icons-material/Done';
import { IReferral } from './types';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { TrafficLight } from 'src/shared/components/trafficLight';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ApiTableRow } from 'src/shared/components/apiTable/ApiTableRow';

interface IProps {
  row: IReferral;
}

export const ReferralRow = ({ row }: IProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patients/${row.patientId}`);
  };

  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <ApiTableRow onClick={handleClick}>
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
            <DoneIcon
              sx={{
                color: '#4caf50',
                padding: '2px',
              }}
            />
            Complete
          </>
        ) : (
          <>
            <ScheduleIcon
              sx={{
                color: '#f44336',
                padding: '2px',
              }}
            />
            Pending
          </>
        )}
      </TableCell>
    </ApiTableRow>
  );
};
