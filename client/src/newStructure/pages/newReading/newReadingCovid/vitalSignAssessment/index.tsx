import React from 'react';
import {
  FormControl,
  Input,
  InputLabel,
  Paper,
  InputAdornment,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { UrineTest } from '../urineTestAssessment';
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
      display: 'block',
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
  vitals: any;
  onChange: any;
  urineTest: any;
  urineTetsOnChange: any;
}
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();

  return (
    <div style={{ display: 'flex' }}>
      <Paper
        style={{
          padding: '35px 25px',
          marginTop: '2%',
          borderRadius: '15px',
          width: '45%',
        }}>
        <h1>
          <b>Vital Sign Assessment</b>
        </h1>

        <form className={classes.root} noValidate autoComplete="off">
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="input-with-icon-adornment">
              Systolic
            </InputLabel>
            <Input
              onChange={props.onChange}
              name={'bpSystolic'}
              value={props.vitals.bpSystolic}
              id="input-with-icon-adornment"
              startAdornment={
                <InputAdornment position="start">
                  <FavoriteIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="input-with-icon-adornment">
              Diastolic
            </InputLabel>
            <Input
              onChange={props.onChange}
              name={'bpDiastolic'}
              value={props.vitals.bpDiastolic}
              id="input-with-icon-adornment"
              startAdornment={
                <InputAdornment position="start">
                  <FavoriteBorderIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="input-with-icon-adornment">
              Heart Rate
            </InputLabel>
            <Input
              onChange={props.onChange}
              name={'heartRateBPM'}
              value={props.vitals.heartRateBPM}
              id="standard-adornment-weight"
              endAdornment={<InputAdornment position="end">BPM</InputAdornment>}
              aria-describedby="standard-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="component-outlined">
              Raspiratory Rate
            </InputLabel>
            <Input
              onChange={props.onChange}
              name={'raspiratoryRate'}
              value={props.vitals.raspiratoryRate}
              id="standard-adornment-weight"
              endAdornment={<InputAdornment position="end">BPM</InputAdornment>}
              aria-describedby="standard-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="component-outlined">
              Oxygen Saturation
            </InputLabel>
            <Input
              onChange={props.onChange}
              name={'oxygenSaturation'}
              value={props.vitals.oxygenSaturation}
              id="standard-adornment-weight"
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
              aria-describedby="standard-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
            />
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel htmlFor="component-outlined">Temperature</InputLabel>
            <Input
              onChange={props.onChange}
              name={'temperature'}
              value={props.vitals.temperature}
              id="standard-adornment-weight"
              endAdornment={<InputAdornment position="end">°C</InputAdornment>}
              aria-describedby="standard-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
            />
          </FormControl>
        </form>
      </Paper>

      <div style={{ marginTop: '2%', width: '45%', marginLeft: '5%' }}>
        <UrineTest
          urineTest={props.urineTest}
          onChange={props.urineTetsOnChange}></UrineTest>
      </div>
    </div>
  );
};

export const VitalSignAssessment = Page;
