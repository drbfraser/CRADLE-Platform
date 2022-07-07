import { Alert, Skeleton } from '@material-ui/lab';
import { Box, Divider, Paper, Typography } from '@material-ui/core';
import { Patient, PatientMedicalInfo } from 'src/shared/types';
import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { OrNull } from 'src/shared/types';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import { RedirectButton } from 'src/shared/components/redirectButton';
import { getPatientMedicalHistoryAsync } from 'src/shared/api';
import { makeStyles } from '@material-ui/core/styles';

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
    <div>
      <div className={classes.historyItem}>
        <b style={{ flex: 1 }}> {title} </b>
        {medicalRecordId ? (
          <RedirectButton
            text="Update"
            redirectUrl={`/patients/${patient?.patientId}/edit/${editId}/${medicalRecordId}`}
          />
        ) : (
          <RedirectButton
            text="Add"
            redirectUrl={`/patients/${patient?.patientId}/edit/${editId}`}
          />
        )}
      </div>
      <div className={classes.historyItem}>
        {historyRecord ? (
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {historyRecord}
          </Typography>
        ) : (
          <>No additional {title.toLowerCase()} information.</>
        )}
      </div>
    </div>
  );

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <RecentActorsIcon fontSize="large" /> &nbsp; Medical Information
          <Link
            to={
              '/history/' +
              patientId +
              '/' +
              patient?.patientName +
              '/' +
              patient?.patientSex
            }
            className={classes.smallLink}>
            View Past Records
          </Link>
        </Typography>
        <Divider />
        <br />
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load patient&rsquo;s medical
            information. Please try refreshing.
          </Alert>
        ) : info ? (
          <div>
            <HistoryItem
              title="Medical History"
              historyRecord={info?.medicalHistory}
              editId="medicalHistory"
              medicalRecordId={info.medicalHistoryId}
            />
            <Divider className={classes.historyItem} />
            <HistoryItem
              title="Drug History"
              historyRecord={info?.drugHistory}
              editId="drugHistory"
              medicalRecordId={info.drugHistoryId}
            />
          </div>
        ) : (
          <Skeleton variant="rect" height={200} />
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
  historyItem: {
    marginBottom: '15px',
  },
});
