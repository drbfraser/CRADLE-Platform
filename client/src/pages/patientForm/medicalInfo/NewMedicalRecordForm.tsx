import { Form, Formik, FormikProps } from 'formik';
import PatientFormHeader from '../PatientFormHeader';
import { PatientField, PatientState } from '../state';
import { MedicalInfoForm } from '.';
import { PrimaryButton } from 'src/shared/components/Button';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './validation';
import { useMutation } from '@tanstack/react-query';
import { EndpointEnum } from 'src/shared/enums';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { useNavigate } from 'react-router-dom';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

type SubmitValues = {
  patientId: string;
  information: string;
};

type Props = {
  patientId: string;
  recordId: string;
  initialState: PatientState;
  isDrugHistory: boolean;
};

const NewMedicalRecordForm = ({
  patientId,
  recordId,
  initialState,
  isDrugHistory,
}: Props) => {
  const navigate = useNavigate();

  const addRecord = useMutation({
    mutationFn: (submitValues: SubmitValues) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_RECORDS;

      return axiosFetch(endpoint, {
        method: 'POST',
        data: { ...submitValues, isDrugRecord: isDrugHistory },
      });
    },
  });

  const handleSubmit = (values: PatientState) => {
    const submitValues = {
      patientId,
      information: values[PatientField.medicalHistory],
    };
    addRecord.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {addRecord.isError && !addRecord.isError && <APIErrorToast />}

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
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <MedicalInfoForm
              formikProps={formikProps}
              creatingNew={false}
              isDrugRecord={isDrugHistory}
            />

            <PrimaryButton
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={addRecord.isPending}>
              Save
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default NewMedicalRecordForm;
