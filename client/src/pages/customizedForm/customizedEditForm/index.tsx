import { useEffect, useState } from 'react';

import { CForm } from 'src/shared/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CustomizedForm } from './CustomizedForm';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getFormResponseAsync } from 'src/shared/api';
import { goBackWithFallback } from 'src/shared/utils';
import { useRouteMatch } from 'react-router-dom';
import { FormRenderStateEnum } from 'src/shared/enums';
import { Box } from '@mui/material';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedEditFormPage = () => {
  const { patientId, formId } = useRouteMatch<RouteParams>().params;
  const [form, setForm] = useState<CForm>();

  useEffect(() => {
    const getFormResponse = async () => {
      try {
        setForm(await getFormResponseAsync(formId));
      } catch (e) {
        console.error(e);
      }
    };
    getFormResponse();
  }, [formId]);

  return (
    <Box
      sx={{
        maxWidth: 1250,
        margin: '0 auto',
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback('/patients')}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Edit Form for {patientId}</Typography>
      </Box>
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.EDIT}
        />
      )}
    </Box>
  );
};
