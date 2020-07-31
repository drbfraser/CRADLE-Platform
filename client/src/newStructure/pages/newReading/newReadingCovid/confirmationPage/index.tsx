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
const getSymptomsMapping = (symptoms: any) => {
  switch (symptoms) {
    case 'none':
      return 'NONE';
    case 'headache':
      return 'HEADACHE';
    case 'bleeding':
      return 'BLEEDING';
    case 'blurredVision':
      return 'BLURRED VISION';
    case 'feverish':
      return 'FEVERISH';
    case 'abdominalPain':
      return 'ABDOMINAL PAIN';
    case 'unwell':
      return 'UNWELL';
    case 'cough':
      return 'COUGH';
    case 'shortnessBreath':
      return 'SHORTNESS of BREATH';
    case 'soreThroat':
      return 'SORE THROAT';
    case 'muscleAche':
      return 'MUSCLE ACHE';
    case 'fatigue':
      return 'FATIGUE';
    case 'lossOfSense':
      return 'LOSS of SENSE';
    case 'lossOfTaste':
      return 'LOSS of TASTE';
    case 'lossOfSmell':
      return 'LOSS of SMELL';
    default:
      return '';
  }
};
interface IProps {
  patient: any;
  symptoms: any;
  vitals: any;
  assessment: any;
  urineTest: any;
  isPatientExisting: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [symptomsString, setSymptomsString] = React.useState('');

  React.useEffect((): void => {
    let stringValue = '';
    for (const [key, value] of Object.entries(props.symptoms)) {
      if (value === true) {
        const pushValue = getSymptomsMapping(key);
        stringValue += pushValue + ',  ';
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
        {!props.isPatientExisting ? (
          <>
            <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>
              Patient Demographics
            </h3>
            <TextField
              disabled={props.patient.patientInitial ? false : true}
              InputProps={{
                readOnly: props.patient.patientInitial ? true : false,
              }}
              label="Initial"
              variant="outlined"
              value={props.patient.patientInitial}
            />
            <TextField
              disabled={props.patient.patientId ? false : true}
              InputProps={{
                readOnly: props.patient.patientId ? true : false,
              }}
              label="Id"
              variant="outlined"
              value={props.patient.patientId}
            />
            <TextField
              disabled={props.patient.household ? false : true}
              InputProps={{
                readOnly: props.patient.household ? true : false,
              }}
              label="House Hold"
              variant="outlined"
              value={props.patient.household}
            />
            <TextField
              disabled={props.patient.patientAge ? false : true}
              InputProps={{
                readOnly: props.patient.patientAge ? true : false,
              }}
              label="Age"
              variant="outlined"
              value={props.patient.patientAge}
            />
            <TextField
              disabled={props.patient.isPregnant ? false : true}
              InputProps={{
                readOnly: props.patient.isPregnant ? true : false,
              }}
              label="Pregnant"
              variant="outlined"
              value={props.patient.isPregnant}
            />
            <TextField
              disabled={props.patient.gestationalAgeValue ? false : true}
              InputProps={{
                readOnly: props.patient.gestationalAgeValue ? true : false,
              }}
              label="Gestational Age"
              variant="outlined"
              value={props.patient.gestationalAgeValue}
            />
            <TextField
              disabled={props.patient.gestationalAgeUnit ? false : true}
              InputProps={{
                readOnly: props.patient.gestationalAgeUnit ? true : false,
              }}
              label="Gestational Age"
              variant="outlined"
              value={
                props.patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
                  ? 'Weeks'
                  : 'Months'
              }
            />
            <TextField
              disabled={props.patient.zone ? false : true}
              InputProps={{
                readOnly: props.patient.zone ? true : false,
              }}
              label="Zone"
              variant="outlined"
              value={props.patient.zone}
            />
            <TextField
              disabled={props.patient.dob ? false : true}
              InputProps={{
                readOnly: props.patient.dob ? true : false,
              }}
              label="DOB"
              variant="outlined"
              value={props.patient.dob}
            />
            <TextField
              disabled={props.patient.villageNumber ? false : true}
              InputProps={{
                readOnly: props.patient.villageNumber ? true : false,
              }}
              label="Village Number"
              variant="outlined"
              value={props.patient.villageNumber}
            />
            <TextField
              disabled={props.patient.drugHistory ? false : true}
              InputProps={{
                readOnly: props.patient.drugHistory ? true : false,
              }}
              label="Drug History"
              variant="outlined"
              value={props.patient.drugHistory}
            />
            <TextField
              disabled={props.patient.medicalHistory ? false : true}
              InputProps={{
                readOnly: props.patient.medicalHistory ? true : false,
              }}
              label="Medical History"
              variant="outlined"
              value={props.patient.medicalHistory}
            />
          </>
        ) : (
          ''
        )}

        <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Symptoms</h3>
        <TextField
          disabled={symptomsString ? false : true}
          InputProps={{
            readOnly: symptomsString ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={4}
          label="Symptoms"
          variant="outlined"
          value={symptomsString}
        />
        <TextField
          disabled={props.symptoms.otherSymptoms ? false : true}
          InputProps={{
            readOnly: props.symptoms.otherSymptoms ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={4}
          label="Other Symptoms"
          variant="outlined"
          value={props.symptoms.otherSymptoms}
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
          disabled={props.vitals.bpSystolic ? false : true}
          InputProps={{
            readOnly: props.vitals.bpSystolic ? true : false,
          }}
          className={classes.formFieldDM}
          label="bpSystolic"
          variant="outlined"
          value={props.vitals.bpSystolic}
        />
        <TextField
          disabled={props.urineTest.leukocytes ? false : true}
          InputProps={{
            readOnly: props.urineTest.leukocytes ? true : false,
          }}
          className={classes.formFieldDM}
          label="leukocytes"
          variant="outlined"
          value={getUrineSign(props.urineTest.leukocytes)}
        />
        <TextField
          disabled={props.vitals.bpDiastolic ? false : true}
          InputProps={{
            readOnly: props.vitals.bpDiastolic ? true : false,
          }}
          className={classes.formFieldDM}
          label="bpDiastolic"
          variant="outlined"
          value={props.vitals.bpDiastolic}
        />
        <TextField
          disabled={props.urineTest.blood ? false : true}
          InputProps={{
            readOnly: props.urineTest.blood ? true : false,
          }}
          className={classes.formFieldDM}
          label="blood"
          variant="outlined"
          value={getUrineSign(props.urineTest.blood)}
        />
        <TextField
          disabled={props.vitals.heartRateBPM ? false : true}
          InputProps={{
            readOnly: props.vitals.heartRateBPM ? true : false,
          }}
          className={classes.formFieldDM}
          label="heartRateBPM"
          variant="outlined"
          value={props.vitals.heartRateBPM}
        />
        <TextField
          disabled={props.urineTest.protein ? false : true}
          InputProps={{
            readOnly: props.urineTest.protein ? true : false,
          }}
          className={classes.formFieldDM}
          label="protein"
          variant="outlined"
          value={getUrineSign(props.urineTest.protein)}
        />
        <TextField
          disabled={props.vitals.respiratoryRate ? false : true}
          InputProps={{
            readOnly: props.vitals.respiratoryRate ? true : false,
          }}
          className={classes.formFieldDM}
          label="respiratoryRate"
          variant="outlined"
          value={props.vitals.respiratoryRate}
        />
        <TextField
          disabled={props.urineTest.glucose ? false : true}
          InputProps={{
            readOnly: props.urineTest.glucose ? true : false,
          }}
          className={classes.formFieldDM}
          label="glucose"
          variant="outlined"
          value={getUrineSign(props.urineTest.glucose)}
        />
        <TextField
          disabled={props.vitals.oxygenSaturation ? false : true}
          InputProps={{
            readOnly: props.vitals.oxygenSaturation ? true : false,
          }}
          className={classes.formFieldDM}
          label="oxygenSaturation"
          variant="outlined"
          value={props.vitals.oxygenSaturation}
        />
        <TextField
          disabled={props.urineTest.nitrites ? false : true}
          InputProps={{
            readOnly: props.urineTest.nitrites ? true : false,
          }}
          className={classes.formFieldDM}
          label="nitrites"
          variant="outlined"
          value={getUrineSign(props.urineTest.nitrites)}
        />
        <TextField
          disabled={props.vitals.temperature ? false : true}
          InputProps={{
            readOnly: props.vitals.temperature ? true : false,
          }}
          className={classes.formFieldDM}
          label="temperature"
          variant="outlined"
          value={props.vitals.temperature}
        />

        <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Assessment</h3>
        <TextField
          disabled={props.assessment.specialInvestigations ? false : true}
          InputProps={{
            readOnly: props.assessment.specialInvestigations ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Special Investigations"
          variant="outlined"
          value={props.assessment.specialInvestigations}
        />
        <TextField
          disabled={props.assessment.finalDiagnosis ? false : true}
          InputProps={{
            readOnly: props.assessment.finalDiagnosis ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Final Diagnosis"
          variant="outlined"
          value={props.assessment.finalDiagnosis}
        />
        <TextField
          disabled={props.assessment.treatmentOP ? false : true}
          InputProps={{
            readOnly: props.assessment.treatmentOP ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Treatement/Operation"
          variant="outlined"
          value={props.assessment.treatmentOP}
        />
        <TextField
          disabled={props.assessment.medPrescribed ? false : true}
          InputProps={{
            readOnly: props.assessment.medPrescribed ? true : false,
          }}
          className={classes.formFieldDM}
          multiline
          rows={3}
          label="Medication Prescribed"
          variant="outlined"
          value={props.assessment.medPrescribed}
        />
        <TextField
          disabled={props.assessment.InstructionFollow ? false : true}
          InputProps={{
            readOnly: props.assessment.InstructionFollow ? true : false,
          }}
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
