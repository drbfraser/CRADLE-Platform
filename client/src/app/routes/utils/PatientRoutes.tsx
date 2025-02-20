import { Route, Routes } from 'react-router-dom';
import { PatientPage } from 'src/pages/patient';
import { PatientFormPage } from 'src/pages/patientForm';
import EditMedicalRecordForm from 'src/pages/patientForm/components/EditMedicalRecordForm';
import EditPersonalInfoForm from 'src/pages/patientForm/components/EditPersonalInfoForm';
import EditPregnancyForm from 'src/pages/patientForm/components/EditPregnancyForm';
import NewMedicalRecordForm from 'src/pages/patientForm/components/NewMedicalRecordForm';
import { NewPatientForm } from 'src/pages/patientForm/components/NewPatientForm';
import NewPregnancyForm from 'src/pages/patientForm/components/NewPregnancyForm';
import { PatientsPage } from 'src/pages/patients';

const PatientFormRoutes = () => {
  const PatientFormNewRoutes = () => (
    <Routes>
      <Route
        path="medicalHistory"
        element={<NewMedicalRecordForm isDrugHistory={false} />}
      />
      <Route
        path="drugHistory"
        element={<NewMedicalRecordForm isDrugHistory={true} />}
      />
      <Route path="pregnancy" element={<NewPregnancyForm />} />
    </Routes>
  );
  const PatientFormEditRoutes = () => (
    <Routes>
      <Route path="personalInfo" element={<EditPersonalInfoForm />} />
      <Route
        path="medicalHistory/:recordId"
        element={<EditMedicalRecordForm isDrugHistory={false} />}
      />
      <Route
        path="drugHistory/:recordId"
        element={<EditMedicalRecordForm isDrugHistory={true} />}
      />
      <Route path="pregnancy/:recordId" element={<EditPregnancyForm />} />
    </Routes>
  );

  return (
    <Routes>
      <Route element={<PatientFormPage />}>
        <Route path="new/*" element={<PatientFormNewRoutes />} />
        <Route path="edit/*" element={<PatientFormEditRoutes />} />
      </Route>
    </Routes>
  );
};

const PatientRoutes = () => {
  return (
    <Routes>
      <Route index element={<PatientsPage />} />

      <Route path="new" element={<PatientFormPage />}>
        <Route index element={<NewPatientForm />} />
      </Route>

      <Route path=":patientId">
        <Route index element={<PatientPage />} />
        <Route path="*" element={<PatientFormRoutes />} />
      </Route>
    </Routes>
  );
};

export default PatientRoutes;
