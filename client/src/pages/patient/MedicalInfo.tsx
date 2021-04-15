import React, { useState } from 'react';
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
import { Patient } from 'src/types';
import { Skeleton } from '@material-ui/lab';
import {
  GestationalAgeUnitEnum,
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
  SexEnum,
} from 'src/enums';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';

interface IProps {
  patient?: Patient;
}

interface HistoryItemProps {
  title: string;
  history: string | null;
}

export const MedicalInfo = ({ patient }: IProps) => {
  const GestationalAge = () => {
    const [unit, setUnit] = useState(patient!.gestationalAgeUnit);

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

    return patient?.isPregnant && patient?.gestationalTimestamp ? (
      <div>
        <p>
          <b>Gestational Age: </b>
          {gestationalAgeUnitFormatters[unit](patient!.gestationalTimestamp)}
        </p>
        <Form.Field
          name="gestationalUnits"
          control={Select}
          options={unitOptions}
          placeholder={gestationalAgeUnitLabels[unit]}
          onChange={handleUnitChange}
        />
        <br />
      </div>
    ) : (
      <></>
    );
  };

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
        {patient ? (
          <div>
            {patient.patientSex === SexEnum.FEMALE && (
              <p>
                <b>Pregnant: </b> {patient.isPregnant ? `Yes` : `No`}
              </p>
            )}
            <GestationalAge />
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
