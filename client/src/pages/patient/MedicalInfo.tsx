// Import necessary components from Material UI
import {
  Alert,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
// Import patient types definition
import { Patient, PatientMedicalInfo } from 'src/shared/types';
// Import useEffect and useState hooks
import { useEffect, useState } from 'react';

// Import other necessary components and utilities
import { Link } from 'react-router-dom';
import { OrNull } from 'src/shared/types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { RedirectButton } from 'src/shared/components/Button';
import { getPatientMedicalHistoryAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';

// Define the props interface for the MedicalInfo component
interface IProps {
  patient?: Patient;
  patientId: string;
}

// MedicalInfo functional component
export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const classes = useStyles();
  // State for storing patient medical information
  const [info, setInfo] = useState<PatientMedicalInfo>();
  // State for handling errors during data loading
  const [errorLoading, setErrorLoading] = useState(false);

  // useEffect hook to load patient medical history
  useEffect(() => {
    const loadMedicalHistory = async () => {
      try {
        // Fetch patient medical history
        setInfo(await getPatientMedicalHistoryAsync(patientId));
      } catch (e) {
        setErrorLoading(true);
      }
    };

    // Call loadMedicalHistory function
    loadMedicalHistory();
  }, [patientId]);

  // Define the props interface for the HistoryItem component
  interface HistoryItemProps {
    title: string;
    historyRecord: OrNull<string> | undefined;
    editId: string;
    medicalRecordId: string | undefined;
    divider?: boolean;
  }

  // HistoryItem functional component
  const HistoryItem = ({
    title,
    historyRecord,
    editId,
    medicalRecordId,
  }: HistoryItemProps) => (
    <Box m="10px">
      <div className={classes.headerWithRightElement}>
        <b>{title}</b>
        {/* Render a redirect button for adding or updating the medical record */}
        <RedirectButton
          size="small"
          url={
            `/patients/${patient?.patientId}/edit/${editId}` +
            (medicalRecordId ? `/${medicalRecordId}` : '')
          }>
          {medicalRecordId ? 'Update' : 'Add'}
        </RedirectButton>
      </div>
      <div>
        {/* Render the history record or a message if it is not available */}
        {historyRecord ? (
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {historyRecord}
          </Typography>
        ) : (
          `No additional ${title.toLowerCase()} information.`
        )}
      </div>
    </Box>
  );

  // Render the MedicalInfo component
  return (
    <Paper>
      <Box p={3}>
        <div className={classes.headerWithRightElement}>
          <Typography
            component="h3"
            variant="h5"
            className={classes.headerWithRightElement}>
            <RecentActorsIcon fontSize="large" />
            &nbsp;Medical Information
          </Typography>
          <Link
            to={
              '/history/' +
              patientId +
              '/' +
              patient?.patientName +
              '/' +
              patient?.patientSex
            }>
            View Past Records
          </Link>
        </div>
        <Divider />
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load patient&rsquo;s medical
            information. Please try refreshing.
          </Alert>
        ) : info ? (
          <>
            <HistoryItem
              title="Medical History"
              historyRecord={info?.medicalHistory}
              editId="medicalHistory"
              medicalRecordId={info.medicalHistoryId}
            />
            <Divider />
            <HistoryItem
              title="Drug History"
              historyRecord={info?.drugHistory}
              editId="drugHistory"
              medicalRecordId={info.drugHistoryId}
            />
          </>
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  smallLink: {
    float: 'right',
    fontSize: 14,
  },
  headerWithRightElement: {
    display: 'flex',
    marginTop: '10px',
    alignItems: 'center',
    placeContent: 'space-between',
  },
  redirectButton: {
    float: 'right',
  },
});
