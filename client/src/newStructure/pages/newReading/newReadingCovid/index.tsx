import React from 'react';
import { connect } from 'react-redux';
import {
  Divider,
  FormControl,
  Input,
  InputLabel,
  // Select,
  FormControlLabel,
  Checkbox,
  Paper,
  FormGroup,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { UrineTestForm } from '../urineTestForm';
import { Demographics } from './demographic';
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
    backButton: {
      margin: theme.spacing(2),
    },
    nextButton: {
      margin: theme.spacing(2),
      float: 'right',
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    formFieldWide: {
      margin: theme.spacing(2),
      minWidth: '56ch',
    },
    formFieldSWide: {
      margin: theme.spacing(2),
      minWidth: '36ch',
    },
  })
);
function getSteps() {
  return [
    'Collect basic demographic info',
    'Collect symptoms',
    'Vitals sign assessment',
    'Assessment',
  ];
}

const Page: React.FC<any> = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <div
      style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <h1 style={{ textAlign: 'center' }}>
        <b>Create a New Reading</b>
      </h1>
      <Divider />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 ? <Demographics></Demographics> : ''}
      {activeStep === 1 ? (
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
                control={<Checkbox checked={true} name="gilad" />}
                label="None (Patient healthy)"
              />
              <FormControlLabel
                control={<Checkbox checked={false} name="jason" />}
                label="Headache"
              />
              <FormControlLabel
                control={<Checkbox checked={true} name="antoine" />}
                label="Blurred Vission"
              />
              <FormControlLabel
                control={<Checkbox checked={true} name="antoine" />}
                label="Abdominal Pain"
              />
            </FormGroup>
            <FormControlLabel
              control={<Checkbox checked={true} name="gilad" />}
              label="Bleeding"
            />
            <FormControlLabel
              control={<Checkbox checked={false} name="jason" />}
              label="Feverish"
            />
            <FormControlLabel
              control={<Checkbox checked={true} name="antoine" />}
              label="Unwell"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Covid</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={false} name="gilad" />}
                label="Cough"
              />
              <FormControlLabel
                control={<Checkbox checked={false} name="jason" />}
                label="Shortness of Breath"
              />
              <FormControlLabel
                control={<Checkbox checked={true} name="antoine" />}
                label="Sore Throat"
              />
              <FormControlLabel
                control={<Checkbox checked={true} name="antoine" />}
                label="Muscle ache"
              />
            </FormGroup>
            <FormControlLabel
              control={<Checkbox checked={true} name="gilad" />}
              label="Fatigue"
            />
            <FormControlLabel
              control={<Checkbox checked={false} name="jason" />}
              label="Loss of sense"
            />
            <FormControlLabel
              control={<Checkbox checked={false} name="jason" />}
              label="Loss of taste"
            />
            <FormControlLabel
              control={<Checkbox checked={false} name="jason" />}
              label="Loss of smell"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormControl className={classes.formFieldDM}>
              <InputLabel htmlFor="component-outlined">Others</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
          </FormControl>
        </Paper>
      ) : (
        ''
      )}
      {activeStep === 2 ? (
        <div>
          <Paper
            style={{
              padding: '35px 25px',
              marginTop: '2%',
              borderRadius: '15px',
            }}>
            <h1>
              <b>Vital Sign Assessment</b>
            </h1>

            <form className={classes.root} noValidate autoComplete="off">
              <FormControl className={classes.formField}>
                <InputLabel required htmlFor="component-simple">
                  Systolic
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel required htmlFor="component-outlined">
                  Diastolic
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel required htmlFor="component-outlined">
                  Hear Rate
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel htmlFor="component-outlined">
                  Raspiratory Rate
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel htmlFor="component-outlined">
                  Oxygen Saturation
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel htmlFor="component-outlined">
                  Temperature
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
              <FormControl className={classes.formField}>
                <InputLabel htmlFor="component-outlined">
                  Raspiratory Rate
                </InputLabel>
                <Input id="component-outlined" />
              </FormControl>
            </form>
          </Paper>
          <div style={{ marginTop: '2%' }}>
            <UrineTestForm
              reading={'' as any}
              onChange={'' as any}
              onSwitchChange={'' as any}
              hasUrineTest={'' as any}
            />
          </div>
        </div>
      ) : (
        ''
      )}
      {activeStep === 3 ? (
        <Paper
          style={{
            padding: '35px 25px',
            marginTop: '2%',
            borderRadius: '15px',
          }}>
          <h1>
            <b>Assessment</b>
          </h1>

          <form className={classes.root} noValidate autoComplete="off">
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-simple">
                Special Inestigation + Results (if avaulable)
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Final Diagnosis
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Treatment/Operation
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Medication Prescribed
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel htmlFor="component-outlined">Frequesncy</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel htmlFor="component-outlined">
                Frequency Unit
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Until</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Until Date</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Other</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
          </form>
        </Paper>
      ) : (
        ''
      )}
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}>
                Back
              </Button>
              <Button
                className={classes.nextButton}
                variant="contained"
                color="primary"
                onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
