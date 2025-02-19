import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { useUpdateMedicalRecordMutation } from '../mutations';
import { initialState, PatientField, PatientState } from '../state';
import PatientFormHeader from './PatientFormHeader';
import { MedicalInfoForm } from './medicalInfo';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './medicalInfo/validation';

type RouteParams = {
  patientId: string;
};
type Props = {
  isDrugHistory: boolean;
};

const NewMedicalRecordForm = ({ isDrugHistory }: Props) => {
  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const addRecord = useUpdateMedicalRecordMutation(patientId, isDrugHistory);

  const handleSubmit = (values: PatientState) => {
    const submitValues = {
      patientId,
      information: isDrugHistory
        ? values[PatientField.drugHistory]
        : values[PatientField.medicalHistory],
    };
    addRecord.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {addRecord.isError && <APIErrorToast onClose={() => addRecord.reset()} />}

      <PatientFormHeader
        patientId={patientId}
        title={`Add ${isDrugHistory ? 'Drug' : 'Medical'} History `}
      />
      <Formik
        initialValues={initialState}
        validationSchema={
          isDrugHistory
            ? drugHistoryValidationSchema
            : medicalHistoryValidationSchema
        }
        onSubmit={handleSubmit}>
        <Form>
          <MedicalInfoForm creatingNew={false} isDrugRecord={isDrugHistory} />
          <PrimaryButton
            sx={{ marginTop: '1rem', float: 'right' }}
            type="submit"
            disabled={addRecord.isPending}>
            Save
          </PrimaryButton>
        </Form>
      </Formik>
    </>
  );
};

export default NewMedicalRecordForm;
