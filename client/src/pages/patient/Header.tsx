import { Grid, IconButton, Tooltip, Typography } from '@mui/material';

import { Add } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Patient } from 'src/shared/types';
import { PrimaryButton } from 'src/shared/components/Button';
import Skeleton from '@mui/material/Skeleton';
import { goBackWithFallback } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';
// Define the props interface for the Header component
interface IProps {
  patient?: Patient;
  isThereAPendingReferral: boolean;
  setConfirmDialogPerformAssessmentOpen: any;
}

// Header functional component
export const Header = ({
  patient,
  isThereAPendingReferral,
  setConfirmDialogPerformAssessmentOpen,
}: IProps) => {
  // useHistory hook to navigate the user
  const history = useHistory();

  // Event handler for submit new form button click
  const handleSubmitNewFormClick = () => {
    if (patient) {
      history.push(`/forms/new/${patient.patientId}`);
    }
  };

  // Event handler for add new reading button click
  const handleAddReadingClick = () => {
    if (patient) {
      history.push(`/readings/new/${patient.patientId}`);
    }
  };

  // Event handler for create referral button click
  const handleCreateReferralClick = () => {
    if (patient) {
      history.push(`/referrals/new/${patient.patientId}`);
    }
  };

  // Event handler for perform assessment button click
  const handlePerformAssessmentClick = () => {
    if (isThereAPendingReferral) {
      setConfirmDialogPerformAssessmentOpen(true);
    } else if (patient) {
      history.push(`/assessments/new/${patient.patientId}`);
    }
  };

  return (
    <Grid container justifyContent="space-between" mb={2}>
      <Grid item>
        <Grid container alignItems="center">
          {/* Render back button with a tooltip */}
          <Tooltip title="Go back" placement="top">
            <IconButton
              onClick={() => goBackWithFallback('/patients')}
              size="large">
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          {/* Render patient summary title */}
          <Typography variant="h4">
            {patient ? (
              `Patient Summary for ${patient.patientName}`
            ) : (
              <Skeleton width={500} />
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container alignItems="center" gap={1} alignContent="center">
          {/* Render submit new form button */}
          <PrimaryButton onClick={handleSubmitNewFormClick}>
            <Add /> Submit New Form
          </PrimaryButton>
          {/* Render add new reading button */}
          <PrimaryButton onClick={handleAddReadingClick}>
            <Add /> Add New Reading
          </PrimaryButton>
          {/* Render create referral button */}
          <PrimaryButton onClick={handleCreateReferralClick}>
            <Add /> Create Referral
          </PrimaryButton>
          {/* Render perform assessment button */}
          <PrimaryButton onClick={handlePerformAssessmentClick}>
            <Add /> Perform Assessment
          </PrimaryButton>
        </Grid>
      </Grid>
    </Grid>
  );
};
