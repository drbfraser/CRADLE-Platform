import React from 'react';
import {
  FormControl,
  Paper,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { UrineTest } from '../urineTestAssessment';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    formField: {
      margin: theme.spacing(1),
      minWidth: '26ch',
      width: '90%',
    },

    formFieldDM: {
      margin: theme.spacing(1),
      minWidth: '48ch',
      minHeight: '15ch',
    },
    formControl: {
      margin: theme.spacing(3),
    },
  })
);
interface IProps {
  vitals: any;
  onChange: any;
  urineTest: any;
  urineTetsOnChange: any;
}
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  console.log(props.vitals.bpSystolicError);

  return (
    <div style={{ display: 'flex' }}>
      <Paper
        style={{
          padding: '10px 25px',
          marginTop: '2%',
          borderRadius: '15px',
          width: '45%',
        }}>
        <h1>
          <b>Vital Signs</b>
        </h1>
        <form className={classes.root} noValidate autoComplete="off">
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.bpSystolicError}
              required
              label={'Systolic'}
              onChange={props.onChange}
              name={'bpSystolic'}
              value={props.vitals.bpSystolic}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">mm/Hg</InputAdornment>
                ),
              }}
              helperText={
                props.vitals.bpSystolicError
                  ? 'Must be an integer between 50 - 300.'
                  : ''
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.bpDiastolicError}
              required
              label={'Diastolic'}
              onChange={props.onChange}
              name={'bpDiastolic'}
              value={props.vitals.bpDiastolic}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">mm/Hg</InputAdornment>
                ),
              }}
              helperText={
                props.vitals.bpDiastolicError
                  ? 'Must be an integer between 30 - 200.'
                  : ''
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.heartRateBPMError}
              required
              label={'Heart Rate'}
              onChange={props.onChange}
              name={'heartRateBPM'}
              value={props.vitals.heartRateBPM}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">BPM</InputAdornment>
                ),
              }}
              variant="outlined"
              type="number"
              helperText={
                props.vitals.heartRateBPMError
                  ? 'Must be an integer between 30 - 250.'
                  : ''
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.respiratoryRateError}
              label={'Respiratory Rate'}
              onChange={props.onChange}
              name={'respiratoryRate'}
              value={props.vitals.respiratoryRate}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">BPM</InputAdornment>
                ),
              }}
              variant="outlined"
              type="number"
              helperText={
                props.vitals.respiratoryRateError
                  ? 'Must be an integer between 1 - 100.'
                  : ''
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.oxygenSaturationError}
              label={'Oxygen Saturation'}
              onChange={props.onChange}
              name={'oxygenSaturation'}
              value={props.vitals.oxygenSaturation}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              variant="outlined"
              type="number"
              helperText={
                props.vitals.oxygenSaturationError
                  ? 'Must be an integer between 50 - 100.'
                  : ''
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <TextField
              error={props.vitals.temperatureError}
              label={'Temperature'}
              onChange={props.onChange}
              name={'temperature'}
              value={props.vitals.temperature}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">°C</InputAdornment>
                ),
              }}
              variant="outlined"
              type="number"
              helperText={
                props.vitals.temperatureError
                  ? 'Must be an integer between 30 - 45.'
                  : ''
              }
            />
          </FormControl>
        </form>
      </Paper>

      <div style={{ marginTop: '2%', width: '50%', marginLeft: '5%' }}>
        <UrineTest
          urineTest={props.urineTest}
          onChange={props.urineTetsOnChange}></UrineTest>
      </div>
    </div>
  );
};

export const VitalSignAssessment = Page;
