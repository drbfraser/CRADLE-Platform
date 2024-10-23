import { useEffect, useState } from 'react';

import { SingleReasonForm } from './SingleReasonForm';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';

export const SingleReasonFormPage = () => {
  const { referralId, cancellationType } = useParams();
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    switch (cancellationType) {
      case 'cancel_referral':
        setTitle('Reason for Cancelling');
        break;
      case 'not_attend_referral':
        setTitle('Reason for Undo Cancelling');
        break;
      case 'undo_cancel_referral':
        setTitle('Reason for Not Attend');
        break;
      default:
        setTitle('');
        break;
    }
  }, [cancellationType]);

  return (
    <FormContainer>
      <Box
        sx={{
          display: `flex`,
          alignItems: `center`,
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => navigate(-1)} size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{title}</Typography>
      </Box>
      <br />
      <SingleReasonForm
        referralId={referralId}
        cancellationType={cancellationType}
      />
    </FormContainer>
  );
};
