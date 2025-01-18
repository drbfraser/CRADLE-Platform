import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { Patient } from 'src/shared/types';

interface IProps {
  patient: Patient | undefined;
  title: string;
}

const PatientHeader = ({ patient, title }: IProps) => {
  const navigate = useNavigate();

  if (!patient) {
    return <Skeleton height={100} width={1000} />;
  }
  return (
    <Box sx={{ display: `flex`, alignItems: `center` }}>
      <Tooltip title="Go back" placement="top">
        <IconButton
          onClick={() => navigate(`/patients/${patient.id}`)}
          size="large">
          <ChevronLeftIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
      <Typography variant={'h4'} component={'h4'}>
        {`${title} for ${patient.name} (${patient.id})`}
      </Typography>
    </Box>
  );
};

export default PatientHeader;
