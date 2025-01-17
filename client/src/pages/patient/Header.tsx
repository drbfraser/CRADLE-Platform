import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Skeleton from '@mui/material/Skeleton';

import { Patient } from 'src/shared/types';
import { PrimaryButton } from 'src/shared/components/Button';

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

  return (
    <Grid container justifyContent="space-between" mb={2}>
      <Grid container alignItems="center">
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => navigate('/patients')} size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          {patient ? (
            `Patient Summary for: ${patient.name} (${patient.id})`
          ) : (
            <Skeleton width={500} />
          )}
        </Typography>
      </Grid>

      <Grid
        container
        alignItems="center"
        gap={1}
        alignContent="center"
        height={'100%'}>
        <PrimaryButton onClick={handleSubmitNewFormClick}>
          <Add /> Submit New Form
        </PrimaryButton>
        <PrimaryButton onClick={handleAddReadingClick}>
          <Add /> Add New Reading
        </PrimaryButton>
        <PrimaryButton onClick={handleCreateReferralClick}>
          <Add /> Create Referral
        </PrimaryButton>
        <PrimaryButton onClick={handlePerformAssessmentClick}>
          <Add /> Perform Assessment
        </PrimaryButton>
      </Grid>
    </Grid>
  );
};
