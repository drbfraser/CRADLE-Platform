import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { FormContainer } from 'src/shared/components/layout/FormContainer';
import { SingleReasonForm } from './SingleReasonForm';

export const SingleReasonFormPage = () => {
  const { referralId, cancellationType } = useParams();
  const navigate = useNavigate();

  if (!referralId || !cancellationType) {
    console.error('ERROR: invalid path.');
    navigate('/referrals', { replace: true });
    return null;
  }

  let title = undefined;
  switch (cancellationType) {
    case 'cancel_referral':
      title = 'Reason for Cancelling';
      break;
    case 'not_attend_referral':
      title = 'Reason for Not Attend';
      break;
    case 'undo_cancel_referral':
      title = 'Reason for Undo Cancelling';
      break;
    default:
      console.warn(`unknown cancellation type: ${cancellationType}`);
      break;
  }

  return (
    <FormContainer>
      <Box
        sx={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => navigate(-1)} size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{title}</Typography>
      </Box>

      <SingleReasonForm
        referralId={referralId}
        cancellationType={cancellationType}
      />
    </FormContainer>
  );
};
