import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import { ReferralForm } from './ReferralForm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';
import { Box } from '@mui/material';

type RouteParams = {
  patientId: string;
};

export const ReferralFormPage = () => {
  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  return (
    <FormContainer>
      <Box
        sx={{
          display: `flex`,
          alignItems: `center`,
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/patients/${patientId}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Referral</Typography>
      </Box>
      <br />
      <ReferralForm patientId={patientId} />
    </FormContainer>
  );
};
