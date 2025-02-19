import { Outlet, Route, Routes } from 'react-router-dom';
import { PatientPage } from 'src/pages/patient';
import { PatientFormPage } from 'src/pages/patientForm';
import EditMedicalRecordForm from 'src/pages/patientForm/components/EditMedicalRecordForm';
import EditPersonalInfoForm from 'src/pages/patientForm/components/EditPersonalInfoForm';
import EditPregnancyForm from 'src/pages/patientForm/components/EditPregnancyForm';
import NewMedicalRecordForm from 'src/pages/patientForm/components/NewMedicalRecordForm';
import { NewPatientForm } from 'src/pages/patientForm/components/NewPatientForm';
import NewPregnancyForm from 'src/pages/patientForm/components/NewPregnancyForm';
import { PatientsPage } from 'src/pages/patients';

const PatientRoutes = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<PatientsPage />} />

        <Route path="new" element={<PatientFormPage />}>
          <Route index element={<NewPatientForm />} />
        </Route>

        <Route path=":patientId/" element={<Outlet />}>
          <Route index element={<PatientPage />} />

          <Route path="new/" element={<PatientFormPage />}>
            <Route
              path="medicalHistory"
              element={<NewMedicalRecordForm isDrugHistory={false} />}
            />
            <Route
              path="drugHistory"
              element={<NewMedicalRecordForm isDrugHistory={true} />}
            />
            <Route path="pregnancy" element={<NewPregnancyForm />} />
          </Route>

          <Route path="edit/" element={<PatientFormPage />}>
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
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default PatientRoutes;
