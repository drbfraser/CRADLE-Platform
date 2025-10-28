import { Paper } from '@mui/material';
import { CustomizedForm } from './CustomizedForm';
import { CForm } from 'src/shared/types/form/formTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { PostBody } from '../handlers';

interface IProps {
  patientId: string;
  fm: CForm;
  renderState: FormRenderStateEnum;
  isModalView?: boolean;
  handleCloseModal?: () => void;
  customSubmitHandler?: (form: CForm, postBody: PostBody) => void;
}

export const CustomizedFormPageContainer = ({
  patientId,
  fm: form,
  renderState,
}: IProps) => {
  return (
    <Paper sx={{ p: 6, mt: 2 }}>
      <CustomizedForm
        patientId={patientId}
        fm={form}
        renderState={renderState}
      />
    </Paper>
  );
};
