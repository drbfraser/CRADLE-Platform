import React, { useState, useEffect } from 'react';
import { Paper, Typography, Divider, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import { Alert, Skeleton } from '@material-ui/lab';
import { Patient, PatientMedicalInfo } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { Link} from 'react-router-dom';
import { EndpointEnum } from 'src/shared/enums';
import { OrNull } from 'src/shared/types';
import { SecondaryRedirectButton } from 'src/shared/components/redirectButton';


interface IProps {
  patient?: Patient;
  patientId: string;
}


export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const classes = useStyles();
  const [info, setInfo] = useState<PatientMedicalInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

/*
  const history = useHistory()
  const handleUpdateClick = (editId: string,medicalRecordId: string) =>
  history.push(`/patients/${patient?.patientId}/edit/${editId}/${medicalRecordId}`)
  */

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_HISTORY
    )
      .then((resp) => resp.json())
      .then((info) => {
        setInfo(info);
      })
      .catch(() => {
        setErrorLoading(true);
      });
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

          <SecondaryRedirectButton
            text="Update"
            redirectUrl={`/patients/${patient?.patientId}/edit/${editId}/${medicalRecordId}`}
          />
        ) : (
          <SecondaryRedirectButton
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
