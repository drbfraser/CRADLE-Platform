import {
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
} from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import { GESTATIONAL_AGE_UNITS } from '../patientInfoForm';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(2),
      },
    },
    formField: {
      margin: theme.spacing(1),
      minWidth: '22ch',
      width: '31.9%',
    },
    expandedFormField: {
      margin: theme.spacing(1),
      minWidth: '22ch',
      width: '65%',
    },
    formFieldSplitLeft: {
      margin: theme.spacing(1),
      width: '15%',
    },
    formFieldSplitRight: {
      margin: theme.spacing(1),
      width: '15.5%',
    },
    formFieldDM: {
      margin: theme.spacing(1),
      minWidth: '48ch',
      minHeight: '15ch',
      width: '48.5%',
    },
    formControl: {
      margin: theme.spacing(3),
    },
    toggle: {
      border: '1px solid #3f51b5 !important',
      fontWeight: 'bold',
      color: '#3f51b5 !important',
    },
  })
);

interface IProps {
  patient: any;
  showPatientId: boolean;
  onChange: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [alignment, setAlignment] = React.useState<string | null>('left');

  const handleAlignment = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    setAlignment(newAlignment);
  };
  return (
    <Paper
      style={{
        padding: '10px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Demographics</b>
      </h1>

      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formField}>
          <TextField
            error={props.patient.patientNameError}
            label={'Patient Name'}
            id="component-outlined"
            name="patientName"
            value={props.patient.patientName}
            onChange={props.onChange}
            required={true}
            variant="outlined"
            type={'text'}
            helperText={
              props.patient.patientNameError
                ? 'please enter alphanumeric characters only.'
                : ''
            }
          />
        </FormControl>
        {props.showPatientId && (
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
                props.patient.patientIdError
                  ? 'Id is too long or too short and must be a number.'
                  : ''
              }
            />
          </FormControl>
        )}
        <FormControl
          className={
            props.showPatientId ? classes.formField : classes.expandedFormField
          }>
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
        {alignment === 'left' ? (
          <FormControl className={classes.formField}>
            <TextField
              error={props.patient.dobError}
              id="date"
              label="Date of Birth"
              type="date"
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
        ) : (
          <FormControl className={classes.formField}>
            <TextField
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
        )}
        <FormControl className={classes.formField}>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment">
            <ToggleButton
              classes={{ selected: classes.toggle }}
              value="left"
              aria-label="left aligned"
              name="dobOrAge">
              Date of Birth
            </ToggleButton>
            <ToggleButton
              classes={{ selected: classes.toggle }}
              value="right"
              aria-label="centered"
              name="dobOrAge">
              Estimated Age
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl className={classes.formFieldSplitLeft}>
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
        <FormControl className={classes.formFieldSplitRight}>
          <TextField
            error={props.patient.villageNumberError}
            label={'Village'}
            id="component-outlined"
            name="villageNumber"
            value={props.patient.villageNumber}
            onChange={props.onChange}
            required={true}
            variant="outlined"
            type={'text'}
            helperText={
              props.patient.villageNumberError
                ? 'Please enter numbers only.'
                : ''
            }
          />
        </FormControl>
        <FormControl className={classes.formFieldSplitLeft}>
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
        <FormControl className={classes.formFieldSplitRight}>
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
                : props.patient.gestationalAgeUnit ===
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
              props.patient.gestationalAgeValueError && props.patient.isPregnant
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
