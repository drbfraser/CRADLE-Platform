import { Route, Routes } from 'react-router-dom';
import { CustomFormPageLayout } from 'src/pages/customizedForm/Layout';

import { CustomizedEditFormPage } from 'src/pages/customizedForm/customizedEditForm';
import { CustomizedNewFormPage } from 'src/pages/customizedForm/customizedNewForm';
import { CustomizedViewFormPage } from 'src/pages/customizedForm/customizedViewForm';

const CustomFormRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomFormPageLayout />}>
        <Route path="/new/:patientId" element={<CustomizedNewFormPage />} />
        <Route
          path="/edit/:patientId/:formId"
          element={<CustomizedEditFormPage />}
        />
        <Route
          path="/view/:patientId/:formId"
          element={<CustomizedViewFormPage />}
        />
      </Route>
    </Routes>
  );
};

export default CustomFormRoutes;
