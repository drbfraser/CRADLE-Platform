
import {
  Alert,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { Patient, PatientMedicalInfo } from 'src/shared/types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrNull } from 'src/shared/types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { RedirectButton } from 'src/shared/components/Button';
import { getPatientMedicalHistoryAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';

// Define the props interface for the MedicalInfo component. This interface
// specifies the properties that the MedicalInfo component expects to receive
// as input. The 'patient' property is an optional Patient object, and the
// 'patientId' property is a string that uniquely identifies the patient.
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

    // Call the loadMedicalHistory function to fetch and set the patient's
    // medical history. This function is called when the component is mounted
    // or when the 'patientId' prop changes.
    loadMedicalHistory();
  }, [patientId]);

  // Props (short for "properties") are a way to pass data from one component
  // to another in a React application, allowing components to communicate with
  // each other and share data or configuration. The 'editId' property is a string used to
  // construct the URL for editing the record. The 'medicalRecordId' property is
  // an optional string that represents the unique identifier of the medical
  // record, used to determine whether to display an "Update" or "Add" button in this case.
  // The 'divider' property is an optional boolean that determines whether a
  // divider should be rendered between history items.
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
    <Box m="20px">
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
