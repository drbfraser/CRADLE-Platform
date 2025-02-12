import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

type Props = {
  patientId?: string;
  title: string;
};

const PatientFormHeader = ({ patientId, title }: Props) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}>
      <Tooltip title="Go back" placement="top">
        <IconButton
          onClick={() => navigate(`/patients/${patientId ?? ''}`)}
          size="large">
          <ChevronLeftIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
      <Typography variant="h4">{title}</Typography>
    </Box>
  );
};

export default PatientFormHeader;
