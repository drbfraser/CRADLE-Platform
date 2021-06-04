import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { IReferral } from './types';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Theme } from '@material-ui/core';

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

  const isBigScreen = useMediaQuery('(min-width:640px)');

  return (
    <tr className={classes.row} onClick={handleClick}>
      {/* <td>
        <span style={{ fontSize: '30px' }}>{row.patientName}</span>
      </td> */}
      <StyledCell label="Patient Name">{row.patientName}</StyledCell>
      <StyledCell label="Patient ID">{row.patientId}</StyledCell>
      <StyledCell label="Village">{row.villageNumber}</StyledCell>
      {/* <td className={classes.cellPadding}>
        <TrafficLight status={row.trafficLightStatus} />
      </td> */}
      <StyledCell label="Vital Sign"> </StyledCell>
      <StyledCell label="Date Referred">
        {moment(row.dateReferred * 1000).format('YYYY-MM-DD')}
      </StyledCell>
      <StyledCell label="Assessment">
        {row.isAssessed ? (
          <>
            <DoneIcon className={classesIcon.green} /> Complete
          </>
        ) : (
          <>
            <ScheduleIcon className={classesIcon.red} /> Pending
          </>
        )}
      </StyledCell>
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

interface StyleProps {
  label: string;
}

const useCellStyles = makeStyles<Theme, StyleProps>(theme => ({
  root: {
    display: 'flex',
    fontSize: '14px',
    '&:before': {
      content: ({ label }) => `"${label}"`,
      fontSize: '14px',
      fontWeight: 'bold',
      width: '160px',
      minWidth: '160px',
    },
  },
}));

interface StyledCellProps {
  children: any;
  label: string;
}

const StyledCell = ({
  children,
  label,
}: StyledCellProps) => {
  const classes = useCellStyles({ label });
  return <td className={classes.root}>{children}</td>;
}
