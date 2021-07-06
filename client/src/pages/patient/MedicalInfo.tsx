import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Alert, Skeleton } from '@material-ui/lab';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { Patient, PatientMedicalInfo } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { Link } from 'react-router-dom';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { useHistory } from 'react-router-dom';
import { getNumOfWeeksNumeric } from 'src/shared/utils';
import { OrNull } from 'src/shared/types';

interface IProps {
  patient?: Patient;
  patientId: string;
}

interface MedicalInfoButtonProps {
  redirectUrl: string;
  text: string;
}

export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const [info, setInfo] = useState<PatientMedicalInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_INFO
    )
      .then((resp) => resp.json())
      .then((info) => {
        setInfo(info);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  const MedicalInfoButton = ({ redirectUrl, text }: MedicalInfoButtonProps) => {
    return (
      <Button
        color="primary"
        variant="outlined"
        className={classes.right}
        onClick={() => history.push(redirectUrl)}>
        {text}
      </Button>
    );
  };

  const PregnancyStatus = () => {
    const status = info!.isPregnant ? 'Yes' : 'No';

    let hasTimedOut = false;
    if (info!.isPregnant) {
      hasTimedOut = getNumOfWeeksNumeric(info!.pregnancyStartDate) > 40;
    }

    const GestationalAge = () => {
      const [unit, setUnit] = useState(info!.gestationalAgeUnit);

      const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
        key: unit,
        text: gestationalAgeUnitLabels[unit],
        value: unit,
      }));

      const handleUnitChange = (
        _: React.ChangeEvent<HTMLInputElement>,
        { value }: InputOnChangeData
      ) => {
        setUnit(value as GestationalAgeUnitEnum);
      };

      return (
        <div>
          <p>
            <b>Gestational Age: </b>
            <span style={hasTimedOut ? { color: 'red' } : {}}>
              {gestationalAgeUnitFormatters[unit](
                info!.pregnancyStartDate,
                null
              )}
            </span>
          </p>
          <Form.Field
            name="gestationalAgeUnits"
            control={Select}
            options={unitOptions}
            placeholder={gestationalAgeUnitLabels[unit]}
            onChange={handleUnitChange}
          />
          <br />
        </div>
      );
    };

    return (
      <div>
        {info!.isPregnant ? (
          <MedicalInfoButton
            text="Edit/Close"
            redirectUrl={`/patients/${patient?.patientId}/edit/pregnancyInfo/${
              info!.pregnancyId
            }`}
          />
        ) : (
          <MedicalInfoButton
            text="Add"
            redirectUrl={`/pregnancies/new/${patient?.patientId}`}
          />
        )}
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {info?.isPregnant && <GestationalAge />}
        {hasTimedOut && (
          <Alert severity="warning">Is the patient still pregnant?</Alert>
        )}
        {!info?.isPregnant && <br />}
      </div>
    );
  };

  interface HistoryItemProps {
    title: string;
    historyRecord: OrNull<string> | undefined;
    editId: string;
    medicalRecordId: string | undefined;
  }

  const HistoryItem = ({
    title,
    historyRecord,
    editId,
    medicalRecordId,
  }: HistoryItemProps) => (
    <Accordion defaultExpanded={true}>
      <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
        <Typography style={{ flex: 1 }}> {title} </Typography>
        {medicalRecordId ? (
          <MedicalInfoButton
            text="Update"
            redirectUrl={`/patients/${patient?.patientId}/edit/${editId}/${medicalRecordId}`}
          />
        ) : (
          <MedicalInfoButton
            text="Add"
            redirectUrl={`/patients/${patient?.patientId}/edit/${editId}`}
          />
        )}
      </AccordionSummary>
      <AccordionDetails>
        {historyRecord ? (
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {historyRecord}
          </Typography>
        ) : (
          <>No additional {title.toLowerCase()} information.</>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <RecentActorsIcon fontSize="large" /> &nbsp; Medical Information
          <Link
            to={'/history/' + patientId + '/' + patient?.patientSex}
            className={classes.smallLink}>
            View History
          </Link>
        </Typography>
        <Divider />
        <br />
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load patient&rsquo;s pregnancy
            status. Please try refreshing.
          </Alert>
        ) : info ? (
          <div>
            {patient && patient.patientSex === SexEnum.FEMALE && (
              <PregnancyStatus />
            )}
            <HistoryItem
              title="Medical History"
              historyRecord={info?.medicalHistory}
              editId="medicalHistory"
              medicalRecordId={info.medicalHistoryId}
            />
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
  right: {
    float: 'right',
  },
  smallLink: {
    float: 'right',
    fontSize: 14,
  },
});
