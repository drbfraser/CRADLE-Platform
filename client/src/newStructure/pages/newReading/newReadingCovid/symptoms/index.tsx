import React from 'react';
import { connect } from 'react-redux';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Paper,
  FormGroup,
  FormLabel,
  TextField,
} from '@material-ui/core';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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

const Page: React.FC<any> = () => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    none: false,
    headache: false,
    bleeding: false,
    blurredVision: false,
    feverish: false,
    abdominalPain: false,
    unwell: false,
    cough: false,
    shortnessBreath: false,
    soreThroat: false,
    muscleAche: false,
    fatigue: false,
    lossOfSense: false,
    lossOfTaste: false,
    lossOfSmell: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <Paper
      style={{
        padding: '35px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Collect Symptoms</b>
      </h1>

      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Regular</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.none}
                name="none"
                onChange={handleChange}
              />
            }
            label="None (Patient healthy)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.headache}
                name="headache"
                onChange={handleChange}
              />
            }
            label="Headache"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.blurredVision}
                name="blurredVision"
                onChange={handleChange}
              />
            }
            label="Blurred Vission"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.abdominalPain}
                name="abdominalPain"
                onChange={handleChange}
              />
            }
            label="Abdominal Pain"
          />
        </FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.bleeding}
              name="bleeding"
              onChange={handleChange}
            />
          }
          label="Bleeding"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.feverish}
              name="feverish"
              onChange={handleChange}
            />
          }
          label="Feverish"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.unwell}
              name="unwell"
              onChange={handleChange}
            />
          }
          label="Unwell"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Covid</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.cough}
                name="cough"
                onChange={handleChange}
              />
            }
            label="Cough"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.shortnessBreath}
                name="shortnessBreath"
                onChange={handleChange}
              />
            }
            label="Shortness of Breath"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.soreThroat}
                name="soreThroat"
                onChange={handleChange}
              />
            }
            label="Sore Throat"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.muscleAche}
                name="muscleAche"
                onChange={handleChange}
              />
            }
            label="Muscle ache"
          />
        </FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.fatigue}
              name="fatigue"
              onChange={handleChange}
            />
          }
          label="Fatigue"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.lossOfSense}
              name="lossOfSense"
              onChange={handleChange}
            />
          }
          label="Loss of sense"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.lossOfTaste}
              name="lossOfTaste"
              onChange={handleChange}
            />
          }
          label="Loss of taste"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.lossOfSmell}
              name="lossOfSmell"
              onChange={handleChange}
            />
          }
          label="Loss of smell"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormControl className={classes.formFieldDM}>
          <TextField
            id="outlined-multiline-static"
            label="Others"
            multiline
            rows={4}
            defaultValue="Others"
            variant="outlined"
          />
        </FormControl>
      </FormControl>
    </Paper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const Symptoms = connect(mapStateToProps, mapDispatchToProps)(Page);
