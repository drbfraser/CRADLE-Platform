import React, { useState } from 'react';

import { SingleReasonForm } from './SingleReasonForm';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { goBackWithFallback } from 'src/shared/utils';
import { useRouteMatch } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';

type RouteParams = {
  referralId: string;
  type: string;
};

export const SingleReasonFormPage = () => {
  const { referralId } = useRouteMatch<RouteParams>().params;
  const { type } = useRouteMatch<RouteParams>().params;
  const [title, setTitle] = useState('');

  React.useEffect(() => {
    switch (type) {
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
  }, [type]);

  return (
    <FormContainer>
      <Box
        sx={{
          display: `flex`,
          alignItems: `center`,
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback('/patients')}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{title}</Typography>
      </Box>
      <br />
      <SingleReasonForm referralId={referralId} type={type} />
    </FormContainer>
  );
};
