import React from 'react';
import Grid from '@material-ui/core/Grid';
import { MedicalInformation } from './medicalInformation';
import { VitalsOverTime } from './vitalsOverTime';
import { vitalsOverTime } from './utils';
import classes from './styles.module.css';

interface IProps {
  selectedPatient: any;
  selectedPatientStatsList: any;
  setState: any;
  showTrafficLights: boolean;
  showVitals: boolean;
};

export const SummaryGrid: React.FC<IProps> = ({ 
  selectedPatient, 
  selectedPatientStatsList, 
  setState, 
  showTrafficLights, 
  showVitals, 
}) => (
  <Grid container={ true } direction="row" spacing={ 4 }>
    <MedicalInformation
      gridClass={ classes.grid }
      iconClass={ classes.icon }
      paperClass={ classes.paper }
      selectedPatient={ selectedPatient }
      setState={ setState }
    />
    <VitalsOverTime
      gridClass={ classes.grid }
      iconClass={ classes.icon }
      paperClass={ classes.paper }
      selectedPatientStatsList={ selectedPatientStatsList }
      setState={ setState }
      showTrafficLights={ showTrafficLights }
      showVitals={ showVitals }
      vitalsOverTime={ vitalsOverTime({
        bpSystolicReadingsMonthlyData: selectedPatientStatsList.bpSystolicReadingsMontly,
        bpDiastolicReadingsMonthlyData: selectedPatientStatsList.bpDiastolicReadingsMontly,
        heartRateReadingsMonthlyData: selectedPatientStatsList.heartRateReadingsMonthly,
      }) }
    />
  </Grid>
);
