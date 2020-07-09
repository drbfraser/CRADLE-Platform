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
  const secret = new Date();
  const secretString = secret.getFullYear() + '-01-01';
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

      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formField}>
          <TextField
            error={props.patient.patientInitialError}
            label={'Patient Initials'}
            id="component-outlined"
            name="patientInitial"
            value={props.patient.patientInitial}
            onChange={props.onChange}
            required={true}
            type={'text'}
            helperText={
              props.patient.patientInitialError ? 'Must Be 1-4 letters.' : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            error={props.patient.patientIdError}
            label={'Patient ID'}
            name="patientId"
            value={props.patient.patientId}
            onChange={props.onChange}
            required={true}
            type={'text'}
            helperText={
              props.patient.patientIdError ? 'Id is too long or too short.' : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            error={props.patient.dobError}
            id="date"
            label="Birthday"
            type="date"
            defaultValue="2004-01-01"
            name="dob"
            value={props.patient.dob}
            onChange={props.onChange}
            InputLabelProps={{
              shrink: true,
            }}
            helperText={
              props.patient.dobError ? 'Must be between 15 - 65.' : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            disabled={props.patient.dob !== secretString}
            error={props.patient.patientAgeError}
            label={'Patient Age'}
            id="component-outlined"
            name="patientAge"
            value={props.patient.patientAge}
            onChange={props.onChange}
            type={'number'}
            helperText={
              props.patient.patientAgeError ? 'Must be between 15 - 65.' : ''
            }
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
          <TextField
            error={
              props.patient.patientSex === 'MALE' || !props.patient.isPregnant
                ? false
                : props.patient.gestationalAgeUnit ==
                  GESTATIONAL_AGE_UNITS.WEEKS
                ? props.patient.gestationalAgeValue < 1 ||
                  props.patient.gestationalAgeValue > 60
                  ? true
                  : false
                : props.patient.gestationalAgeValue < 1 ||
                  props.patient.gestationalAgeValue > 13
                ? true
                : false
            }
            label={'Gestational Age'}
            disabled={
              props.patient.patientSex === 'MALE' || !props.patient.isPregnant
            }
            InputProps={{ inputProps: { min: 0, max: 10 } }}
            id="component-outlined"
            name="gestationalAgeValue"
            type={'number'}
            value={props.patient.gestationalAgeValue}
            onChange={props.onChange}
            helperText={
              props.patient.gestationalAgeValueError
                ? 'Value too large or too small.'
                : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <InputLabel required htmlFor="component-outlined">
            Gestational Age Unit
          </InputLabel>
          <Select
            native
            disabled={
              props.patient.patientSex === 'MALE' || !props.patient.isPregnant
            }
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
