import { CForm } from 'src/shared/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import IconButton from '@mui/material/IconButton';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { FormRenderStateEnum } from 'src/shared/enums';
import { Box, Skeleton, styled } from '@mui/material';
import usePatient from 'src/shared/hooks/patient';

type RouteParams = {
  patientId: string;
};

const Container = styled(Box)(() => ({
  maxWidth: 1250,
  margin: '0 auto',
}));

const Header = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

export const CustomizedFormPage = () => {
  const { patientId } = useParams() as RouteParams;
  const [form, setForm] = useState<CForm>();
  const navigate = useNavigate();

  const [patient] = usePatient(patientId);

  return (
    <Container>
      <Header>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/patients/${patientId}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant={'h4'} component={'h4'}>
          {patient ? (
            `New Form for: ${patient.name} (${patient.id})`
          ) : (
            <Skeleton width={500} />
          )}
        </Typography>
      </Header>

      <SelectHeaderForm setForm={setForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
      )}
    </Container>
  );
};
