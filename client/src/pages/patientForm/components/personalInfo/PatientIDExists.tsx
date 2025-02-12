import { Link } from 'react-router-dom';
import { Box } from '@mui/material';

interface IProps {
  patientId: string;
}

export const PatientIDExists = (props: IProps) => {
  return (
    <Box
      sx={{
        padding: '3px',
        color: '#f44336',
      }}>
      Patient ID {props.patientId} already exists.{' '}
      <Link to={'/patients/' + props.patientId}>View patient.</Link>
    </Box>
  );
};
