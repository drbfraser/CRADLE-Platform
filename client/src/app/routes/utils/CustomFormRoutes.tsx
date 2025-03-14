import { Route, Routes } from 'react-router-dom';
import { CustomFormPageLayout } from 'src/pages/customizedForm/Layout';

import { CustomizedEditFormPage } from 'src/pages/customizedForm/customizedEditFormPage';
import { CustomizedNewFormPage } from 'src/pages/customizedForm/customizedNewFormPage';
import { CustomizedViewFormPage } from 'src/pages/customizedForm/customizedViewFormPage';

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
