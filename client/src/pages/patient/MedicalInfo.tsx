import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Alert, Skeleton } from '@material-ui/lab';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { Patient, Pregnancy } from 'src/shared/types';
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
import { getNumOfWeeksNumeric } from 'src/shared/utils';

interface IProps {
  patient?: Patient;
  patientId: string;
}

export const MedicalInfo = ({ patient, patientId }: IProps) => {
  const [pregnancy, setPregnancy] = useState<Pregnancy>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PREGNANCY_STATUS
    )
      .then((resp) => resp.json())
      .then((pregnancy) => {
        setPregnancy(pregnancy);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  const PregnancyStatus = () => {
    const status = pregnancy!.isPregnant ? 'Yes' : 'No';

    let isTimedOut = false;
    if (pregnancy!.isPregnant) {
      isTimedOut = getNumOfWeeksNumeric(pregnancy!.startDate) > 40;
    }

    const GestationalAge = () => {
      const [unit, setUnit] = useState(pregnancy!.defaultTimeUnit);

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
            <span style={isTimedOut ? { color: 'red' } : {}}>
              {gestationalAgeUnitFormatters[unit](pregnancy!.startDate)}
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
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {pregnancy?.isPregnant && <GestationalAge />}
        {isTimedOut && (
          <Alert severity="warning">Is the patient still pregnant?</Alert>
        )}
      </div>
    );
  };

  interface HistoryItemProps {
    title: string;
    history: string | null;
  }

  const HistoryItem = ({ title, history }: HistoryItemProps) =>
    history ? (
      <Accordion>
        <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{history}</Typography>
        </AccordionDetails>
      </Accordion>
    ) : (
      <></>
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
        ) : patient && pregnancy ? (
          <div>
            {patient.patientSex === SexEnum.FEMALE && <PregnancyStatus />}
            <HistoryItem title="Drug history" history={patient.drugHistory} />
            <HistoryItem
              title="Medical history"
              history={patient.medicalHistory}
            />
            {patient.patientSex !== SexEnum.FEMALE &&
              !patient.drugHistory &&
              !patient.medicalHistory && (
                <>No additional medical information.</>
              )}
          </div>
        ) : (
          <Skeleton variant="rect" height={200} />
        )}
      </Box>
    </Paper>
  );
};
