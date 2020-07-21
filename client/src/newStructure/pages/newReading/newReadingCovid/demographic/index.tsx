import React from 'react';

import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Paper,
  TextField,
  MenuItem,
  Switch,
  Grid,
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
      width: '30%',
    },
    formFieldDM: {
      margin: theme.spacing(2),
      minWidth: '48ch',
      minHeight: '15ch',
      width: '46.5%',
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
        <b>Demographics</b>
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
            variant="outlined"
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
            variant="outlined"
            helperText={
              props.patient.patientIdError ? 'Id is too long or too short.' : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            label={'Household Number'}
            id="component-outlined"
            name="household"
            value={props.patient.household}
            onChange={props.onChange}
            variant="outlined"
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            disabled={props.patient.dobOrAge}
            error={props.patient.dobError}
            id="date"
            label="Birthday"
            type="date"
            defaultValue="2004-01-01"
            name="dob"
            value={props.patient.dob}
            variant="outlined"
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
          <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>Birthday</Grid>
            <Grid item>
              <Switch
                checked={props.patient.dobOrAge}
                onChange={props.onChange}
                name="dobOrAge"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
            </Grid>
            <Grid item>Age</Grid>
          </Grid>
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            disabled={!props.patient.dobOrAge}
            error={props.patient.patientAgeError}
            label={'Patient Age'}
            id="component-outlined"
            name="patientAge"
            value={props.patient.patientAge}
            onChange={props.onChange}
            type={'number'}
            variant="outlined"
            helperText={
              props.patient.patientAgeError ? 'Must be between 15 - 65.' : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            label={'Gender'}
            select
            name="patientSex"
            value={props.patient.patientSex}
            onChange={props.onChange}
            variant="outlined">
            <MenuItem value={'MALE'}>Male</MenuItem>
            <MenuItem value={'FEMALE'}>Female</MenuItem>
            <MenuItem value={'OTHER'}>Other</MenuItem>
          </TextField>
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
            variant="outlined"
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
          <TextField
            label={' Gestational Age Unit'}
            id="component-outlined"
            select
            disabled={
              props.patient.patientSex === 'MALE' || !props.patient.isPregnant
            }
            name="gestationalAgeUnit"
            value={props.patient.gestationalAgeUnit}
            onChange={props.onChange}
            variant="outlined">
            <MenuItem value={GESTATIONAL_AGE_UNITS.WEEKS}>Weeks</MenuItem>
            <MenuItem value={GESTATIONAL_AGE_UNITS.MONTHS}>Months</MenuItem>
          </TextField>
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            label={'Zone'}
            id="component-outlined"
            name="zone"
            value={props.patient.zone}
            onChange={props.onChange}
            variant="outlined"
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formField}>
          <TextField
            label={'Village'}
            id="component-outlined"
            name="villageNumber"
            value={props.patient.villageNumber}
            onChange={props.onChange}
            variant="outlined"
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formFieldDM}>
          <TextField
            label={'Drug History'}
            id="component-outlined"
            multiline
            rows={4}
            name="drugHistory"
            value={props.patient.drugHistory}
            onChange={props.onChange}
            variant="outlined"
            type={'text'}
          />
        </FormControl>
        <FormControl className={classes.formFieldDM}>
          <TextField
            label={'Medical History'}
            id="component-outlined"
            name="medicalHistory"
            multiline
            rows={4}
            value={props.patient.medicalHistory}
            onChange={props.onChange}
            variant="outlined"
            type={'text'}
          />
        </FormControl>
      </form>
    </Paper>
  );
};

export const Demographics = Page;
