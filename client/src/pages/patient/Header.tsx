import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { Add } from '@mui/icons-material';

import { Patient } from 'src/shared/types/patientTypes';
import { PrimaryButton } from 'src/shared/components/Button';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';

interface IProps {
  patient?: Patient;
  isThereAPendingReferral: boolean;
  setConfirmDialogPerformAssessmentOpen: (isOpen: boolean) => void;
}

export const Header = ({
  patient,
  isThereAPendingReferral,
  setConfirmDialogPerformAssessmentOpen,
}: IProps) => {
  const navigate = useNavigate();

  const handleSubmitNewFormClick = () => {
    if (patient) {
      navigate(`/forms/new/${patient.id}`);
    }
  };

  const handleAddReadingClick = () => {
    if (patient) {
      navigate(`/readings/new/${patient.id}`);
    }
  };

  const handleCreateReferralClick = () => {
    if (patient) {
      navigate(`/referrals/new/${patient.id}`);
    }
  };

  const handlePerformAssessmentClick = () => {
    if (isThereAPendingReferral) {
      setConfirmDialogPerformAssessmentOpen(true);
    } else if (patient) {
      navigate(`/assessments/new/${patient.id}`);
    }
  };

  const disableButtons = !patient;
  return (
    <Grid container justifyContent="space-between" mb={2} gap={1}>
      <Grid container alignItems="center">
        <PatientHeader
          title="Patient Summary"
          patient={patient}
          goBackRoute="/patients"
        />
      </Grid>

      <Grid
        container
        height={'100%'}
        alignItems="center"
        alignContent="center"
        gap={2}>
        <PrimaryButton
          onClick={handleSubmitNewFormClick}
          disabled={disableButtons}>
          <Add /> Submit New Form
        </PrimaryButton>
        <PrimaryButton
          onClick={handleAddReadingClick}
          disabled={disableButtons}>
          <Add /> Add New Reading
        </PrimaryButton>
        <PrimaryButton
          onClick={handleCreateReferralClick}
          disabled={disableButtons}>
          <Add /> Create Referral
        </PrimaryButton>
        <PrimaryButton
          onClick={handlePerformAssessmentClick}
          disabled={disableButtons}>
          <Add /> Perform Assessment
        </PrimaryButton>
      </Grid>
    </Grid>
  );
};
