import React from 'react';

import {
  FormControl,
  Input,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Paper,
  TextField,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { GESTATIONAL_AGE_UNITS } from '../../patientInfoForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(2),
      },
    },
    formField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
    },
    formFieldDM: {
      margin: theme.spacing(2),
      minWidth: '48ch',
      minHeight: '15ch',
    },
    formControl: {
      margin: theme.spacing(3),
    },
  })
);

interface IProps {
  patient: any;
  onChange: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();

  return (
    <Paper
      style={{
        padding: '35px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Collect Basic Demographic</b>
      </h1>

      <form className={classes.root} noValidate autoComplete="off">
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-simple">
            Patient Initials
          </InputLabel>
          <Input
            id="component-outlined"
            name="patientInitial"
            value={props.patient.patientInitial}
            onChange={props.onChange}
            required={true}
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-outlined">
            ID
          </InputLabel>
          <Input
            id="component-outlined"
            name="patientId"
            value={props.patient.patientId}
            onChange={props.onChange}
            required={true}
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            id="date"
            label="Birthday"
            type="date"
            defaultValue="2017-05-24"
            name="dob"
            value={props.patient.dob}
            onChange={props.onChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel htmlFor="component-outlined">Age</InputLabel>
          <Input
            id="component-outlined"
            name="patientAge"
            value={props.patient.patientAge}
            onChange={props.onChange}
            type={'number'}
            inputProps={{ inputProps: { min: 0, max: 10 } }}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-outlined">
            Gender
          </InputLabel>
          <Select
            native
            name="patientSex"
            value={props.patient.patientSex}
            onChange={props.onChange}
            labelId="demo-simple-select-label"
            id="demo-simple-select">
            <option value={'MALE'}>Male</option>
            <option value={'FEMALE'}>Female</option>
            <option value={'OTHER'}>Other</option>
          </Select>
        </FormControl>
        <FormControl className={classes.formField}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={props.patient.patientSex === 'MALE'}
                checked={props.patient.isPregnant}
                onChange={props.onChange}
                name="isPregnant"
              />
            }
            label="Pregnant"
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel htmlFor="component-outlined">
            House Hold Number
          </InputLabel>
          <Input
            id="component-outlined"
            name="household"
            value={props.patient.household}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-outlined">
            Gestational Age
          </InputLabel>
          <Input
            disabled={props.patient.patientSex === 'MALE'}
            id="component-outlined"
            name="gestationalAgeValue"
            value={props.patient.gestationalAgeValue}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-outlined">
            Gestational Age Unit
          </InputLabel>
          <Select
            native
            disabled={props.patient.patientSex === 'MALE'}
            name="gestationalAgeUnit"
            value={props.patient.gestationalAgeUnit}
            onChange={props.onChange}
            labelId="demo-simple-select-label"
            id="demo-simple-select">
            <option value={GESTATIONAL_AGE_UNITS.WEEKS}>Weeks</option>
            <option value={GESTATIONAL_AGE_UNITS.MONTHS}>Months</option>
          </Select>
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel htmlFor="component-outlined">Zone</InputLabel>
          <Input
            id="component-outlined"
            name="zone"
            value={props.patient.zone}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel htmlFor="component-outlined">Village</InputLabel>
          <Input
            id="component-outlined"
            name="villageNumber"
            value={props.patient.villageNumber}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldDM}>
          <InputLabel htmlFor="component-outlined">Drug History</InputLabel>
          <Input
            id="component-outlined"
            name="drugHistory"
            value={props.patient.drugHistory}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldDM}>
          <InputLabel htmlFor="component-outlined">Medical History</InputLabel>
          <Input
            id="component-outlined"
            name="medicalHistory"
            value={props.patient.medicalHistory}
            onChange={props.onChange}
          />
        </FormControl>
      </form>
    </Paper>
  );
};

export const Demographics = Page;
