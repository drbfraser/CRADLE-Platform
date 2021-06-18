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
import { Skeleton } from '@material-ui/lab';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { Patient, Pregnancy } from 'src/shared/types';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric } from 'src/shared/utils';

interface IProps {
  patient?: Patient;
  pregnancy?: Pregnancy;
}

export const MedicalInfo = ({ patient, pregnancy }: IProps) => {
  const PregnancyStatus = () => {
    let status = 'No';

    if (pregnancy!.isPregnant) {
      status = 'Yes';
      if (getNumOfWeeksNumeric(pregnancy!.startDate) > 40) {
        status = 'Is the patient still pregnant?';
      }
    }

    return (
      <div>
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {pregnancy?.isPregnant && <GestationalAge />}
      </div>
    );
  };

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
          {gestationalAgeUnitFormatters[unit](pregnancy!.startDate)}
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
        {patient ? (
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
