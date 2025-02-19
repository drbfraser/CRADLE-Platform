import { Outlet } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';

export const PatientFormPage = () => {
  return (
    <FormContainer>
      <Outlet />
    </FormContainer>
  );
};
