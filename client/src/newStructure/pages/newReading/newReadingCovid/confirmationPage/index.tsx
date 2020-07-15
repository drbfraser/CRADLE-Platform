import React from 'react';

import { Paper, TextField } from '@material-ui/core';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { GESTATIONAL_AGE_UNITS } from '../../patientInfoForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    formField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
      width: '30%',
    },
    formFieldDM: {
      margin: theme.spacing(1),
      minWidth: '48ch',
      width: '46.5%',
    },
    formControl: {
      margin: theme.spacing(3),
    },
  })
);

interface IProps {
  patient: any;
  symptoms: any;
  vitals: any;
  assessment: any;
  urineTest: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [symptomsString, setSymptomsString] = React.useState('');

  React.useEffect((): void => {
    let stringValue = '';
    for (const [key, value] of Object.entries(props.symptoms)) {
      if (value === true) {
        stringValue += key + ', ';
      }
    }
    setSymptomsString(stringValue);
  }, []);

  const getUrineSign = (key: string) => {
    if (key === 'm') {
      return '-';
    }
    if (key === 'p') {
      return '+';
    }
    if (key === 'pp') {
      return '++';
    }
    if (key === 'ppp') {
      return '+++';
    }
    return '';
  };
  return (
    <Paper
      style={{
        padding: '35px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Confirm Information</b>
      </h1>
      <form className={classes.root} noValidate autoComplete="off">
        <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>
          Patient Demographics
        </h3>
        <TextField
          disabled={true}
          label="Initial"
          variant="outlined"
          value={props.patient.patientInitial}
        />
        <TextField
          disabled={true}
          label="Id"
          variant="outlined"
          value={props.patient.patientId}
        />
        <TextField
          disabled={true}
          label="Name"
          variant="outlined"
          value={props.patient.patientName}
        />
        <TextField
          disabled={true}
          label="House Hold"
          variant="outlined"
          value={props.patient.household}
        />
        <TextField
          disabled={true}
          label="Age"
          variant="outlined"
          value={props.patient.patientAge}
        />
        <TextField
          disabled={true}
          label="Pregnant"
          variant="outlined"
          value={props.patient.isPregnant}
        />
        <TextField
          disabled={true}
          label="Gestational Age"
          variant="outlined"
          value={props.patient.gestationalAgeValue}
        />
        <TextField
          disabled={true}
          label="Gestational Age"
          variant="outlined"
          value={
            props.patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
              ? 'Weeks'
              : 'Months'
          }
        />
        <TextField
          disabled={true}
          label="Zone"
          variant="outlined"
          value={props.patient.zone}
        />
        <TextField
          disabled={true}
          label="DOB"
          variant="outlined"
          value={props.patient.dob}
        />
        <TextField
          disabled={true}
          label="Village Number"
          variant="outlined"
          value={props.patient.villageNumber}
        />
        <TextField
          disabled={true}
          label="Drug History"
          variant="outlined"
          value={props.patient.drugHistory}
        />
        <TextField
          disabled={true}
          label="Medical History"
          variant="outlined"
          value={props.patient.medicalHistory}
        />

        <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Symptoms</h3>
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={4}
          label="Other Symptoms"
          variant="outlined"
          value={props.symptoms.otherSymptoms}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={4}
          label="Symptoms"
          variant="outlined"
          value={symptomsString}
        />

        <h3
          style={{
            color: '#9E9E9E',
            fontSize: '18px',
            width: '51ch',
            display: 'inline',
            float: 'left',
          }}>
          Vitals
        </h3>
        <h3
          style={{
            color: '#9E9E9E',
            fontSize: '18px',
            width: '45%',
            display: 'inline',
            float: 'left',
          }}>
          Urine Test
        </h3>
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="bpSystolic"
          variant="outlined"
          value={props.vitals.bpSystolic}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="leukocytes"
          variant="outlined"
          value={getUrineSign(props.urineTest.leukocytes)}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="bpDiastolic"
          variant="outlined"
          value={props.vitals.bpDiastolic}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="blood"
          variant="outlined"
          value={getUrineSign(props.urineTest.blood)}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="heartRateBPM"
          variant="outlined"
          value={props.vitals.heartRateBPM}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="protein"
          variant="outlined"
          value={getUrineSign(props.urineTest.protein)}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="respiratoryRate"
          variant="outlined"
          value={props.vitals.respiratoryRate}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="glucose"
          variant="outlined"
          value={getUrineSign(props.urineTest.glucose)}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="oxygenSaturation"
          variant="outlined"
          value={props.vitals.oxygenSaturation}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="nitrites"
          variant="outlined"
          value={getUrineSign(props.urineTest.nitrites)}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          label="temperature"
          variant="outlined"
          value={props.vitals.temperature}
        />

        <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Assessment</h3>
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Special Investigations"
          variant="outlined"
          value={props.assessment.specialInvestigations}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Final Diagnosis"
          variant="outlined"
          value={props.assessment.finalDiagnosis}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Treatement/Operation"
          variant="outlined"
          value={props.assessment.treatmentOP}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Medication Prescribed"
          variant="outlined"
          value={props.assessment.medPrescribed}
        />
        <TextField
          disabled={true}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Instruction for Follow"
          variant="outlined"
          value={props.assessment.InstructionFollow}
        />
      </form>
    </Paper>
  );
};

export const ConfirmationPage = Page;
