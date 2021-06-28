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

export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const [info, setInfo] = useState<PatientMedicalInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  const handleEditClick = (editId: string) =>
    history.push(`/patients/edit/${editId}/${patient?.patientId}`);

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
              {gestationalAgeUnitFormatters[unit](info!.pregnancyStartDate)}
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
          <Button
            color="primary"
            variant="outlined"
            className={classes.right}
            onClick={() =>
              history.push(
                `/patients/edit/pregnancyInfo/${patient?.patientId}/${
                  info!.pregnancyId
                }`
              )
            }>
            Update/Close Pregnancy
          </Button>
        ) : (
          <Button
            color="primary"
            variant="outlined"
            className={classes.right}
            onClick={() =>
              history.push(`/patients/newPregnancy/${patient?.patientId}`)
            }>
            Add New Pregnancy
          </Button>
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
    history: OrNull<string> | undefined;
    editId: string;
  }

  const HistoryItem = ({ title, history, editId }: HistoryItemProps) => (
    <Accordion>
      <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
        <Typography style={{ flex: 1 }}> {title} </Typography>
        <Button
          color="primary"
          variant="outlined"
          className={classes.right}
          onClick={() => handleEditClick(editId)}>
          {history ? 'Update' : 'Add'}
        </Button>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          {history ? (
            history
          ) : (
            <>No additional {title.toLowerCase()} information.</>
          )}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <RecentActorsIcon fontSize="large" /> &nbsp; Medical Information
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
              history={info?.medicalHistory}
              editId="medicalHistory"
            />
            <HistoryItem
              title="Drug History"
              history={info?.drugHistory}
              editId="drugHistory"
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
});
