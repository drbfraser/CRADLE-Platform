import React, { useState } from 'react';
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
import { Patient } from 'src/shared/types';
import { Skeleton } from '@material-ui/lab';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { useHistory } from 'react-router-dom';

interface IProps {
  patient?: Patient;
}

export const MedicalInfo = ({ patient }: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const handleEditClick = (editId: string) =>
    history.push(`/patients/edit/${editId}/${patient?.patientId}`);

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

  interface HistoryItemProps {
    title: string;
    history: string | null;
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
          {history ? 'Edit' : 'Add'}
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
        {patient ? (
          <div>
            {patient.patientSex === SexEnum.FEMALE && (
              <p>
                <b>Pregnant: </b> {patient.isPregnant ? `Yes` : `No`}
              </p>
            )}
            <GestationalAge />
            <HistoryItem
              title="Drug History"
              history={patient.drugHistory}
              editId="drugHistory"
            />

            <HistoryItem
              title="Medical History"
              history={patient.medicalHistory}
              editId="medicalHistory"
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
