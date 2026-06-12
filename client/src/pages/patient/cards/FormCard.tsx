import { Box, Typography } from '@mui/material';
import { AssignmentInd } from '@mui/icons-material';
import { CustomizedForm } from 'src/shared/types/form/formTemplateTypes';
import { RedirectButton } from 'src/shared/components/Button';
import { getPrettyDateTime } from 'src/shared/utils';
import { CardContainer } from './CardContainer';

interface ICustomizedFormCardProps {
  form: CustomizedForm;
}

export const CustomizedFormCard = ({ form }: ICustomizedFormCardProps) => (
  <CardContainer>
    <Typography variant={'h5'} component={'h5'}>
      <>
        <AssignmentInd fontSize="large" /> {form.name}
      </>
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        {`Last Edit : ${getPrettyDateTime(form.lastEdited)}`}
      </Typography>
    </Box>

    <RedirectButton url={`/forms/view/${form.patientId}/${form.id}`}>
      View Form
    </RedirectButton>
  </CardContainer>
);
