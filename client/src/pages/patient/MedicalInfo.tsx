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

interface IProps {
  patient?: Patient;
  patientId: string;
}

export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const classes = useStyles();
  const [info, setInfo] = useState<PatientMedicalInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const loadMedicalHistory = async () => {
      try {
        setInfo(await getPatientMedicalHistoryAsync(patientId));
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadMedicalHistory();
  }, [patientId]);

  interface HistoryItemProps {
    title: string;
    historyRecord: OrNull<string> | undefined;
    editId: string;
    medicalRecordId: string | undefined;
    divider?: boolean;
  }

  const HistoryItem = ({
    title,
    historyRecord,
    editId,
    medicalRecordId,
  }: HistoryItemProps) => (
    <Box m="10px">
      <div className={classes.headerWithRightElement}>
        <b>{title}</b>
        <RedirectButton
          size="small"
          url={`/patients/${patient?.patientId}/edit/${editId}`}>
          {medicalRecordId ? 'Update' : 'Add'}
        </RedirectButton>
      </div>
      <div>
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
