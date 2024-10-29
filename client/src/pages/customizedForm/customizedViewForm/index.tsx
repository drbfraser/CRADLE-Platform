import { useEffect, useState } from 'react';

import { CForm } from 'src/shared/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CustomizedForm } from '../customizedEditForm/CustomizedForm';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getFormResponseAsync } from 'src/shared/api';
import { useNavigate, useParams } from 'react-router-dom';
import { FormRenderStateEnum } from 'src/shared/enums';
import { Box } from '@mui/material';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedViewFormPage = () => {
  const { patientId, formId } = useParams() as RouteParams;
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

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 1250,
        margin: '0 auto',
      }}>
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
        <Typography variant="h4">View Form for {patientId}</Typography>
      </Box>
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.VIEW}
        />
      )}
    </Box>
  );
};
