import React from 'react';
import { connect } from 'react-redux';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Paper,
  FormGroup,
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
interface IProps {
  symptoms: any;
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
        <b>Collect Symptoms</b>
      </h1>

      <FormControl component="fieldset" className={classes.formControl}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.none}
                name="none"
                onChange={props.onChange}
              />
            }
            label="None (Patient healthy)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.headache}
                name="headache"
                onChange={props.onChange}
              />
            }
            label="Headache"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.blurredVision}
                name="blurredVision"
                onChange={props.onChange}
              />
            }
            label="Blurred Vission"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.abdominalPain}
                name="abdominalPain"
                onChange={props.onChange}
              />
            }
            label="Abdominal Pain"
          />
        </FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.bleeding}
              name="bleeding"
              onChange={props.onChange}
            />
          }
          label="Bleeding"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.feverish}
              name="feverish"
              onChange={props.onChange}
            />
          }
          label="Feverish"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.unwell}
              name="unwell"
              onChange={props.onChange}
            />
          }
          label="Unwell"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.cough}
                name="cough"
                onChange={props.onChange}
              />
            }
            label="Cough"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.shortnessBreath}
                name="shortnessBreath"
                onChange={props.onChange}
              />
            }
            label="Shortness of Breath"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.soreThroat}
                name="soreThroat"
                onChange={props.onChange}
              />
            }
            label="Sore Throat"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.symptoms.muscleAche}
                name="muscleAche"
                onChange={props.onChange}
              />
            }
            label="Muscle ache"
          />
        </FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.fatigue}
              name="fatigue"
              onChange={props.onChange}
            />
          }
          label="Fatigue"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.lossOfSense}
              name="lossOfSense"
              onChange={props.onChange}
            />
          }
          label="Loss of sense"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.lossOfTaste}
              name="lossOfTaste"
              onChange={props.onChange}
            />
          }
          label="Loss of taste"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.symptoms.lossOfSmell}
              name="lossOfSmell"
              onChange={props.onChange}
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
            name={'otherSymptoms'}
            value={props.symptoms.otherSymptoms}
            variant="outlined"
            onChange={props.onChange}
          />
        </FormControl>
      </FormControl>
    </Paper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const Symptoms = connect(mapStateToProps, mapDispatchToProps)(Page);
