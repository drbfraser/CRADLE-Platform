import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Button, Divider, Icon } from 'semantic-ui-react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import classes from './styles.module.css';
import { TrafficLightEnum } from '../../../../../enums';

interface IProps {
  gridClass: string;
  iconClass: string;
  paperClass: string;
  selectedPatientStatsList: any;
  setState: any;
  showTrafficLights: boolean;
  showVitals: boolean;
  vitalsOverTime: any;
};

export const VitalsOverTime: React.FC<IProps> = ({ 
  gridClass, 
  iconClass, 
  paperClass, 
  selectedPatientStatsList,
  setState,
  showTrafficLights, 
  showVitals, 
  vitalsOverTime,
}) => {
  const trafficLight = selectedPatientStatsList.trafficLightCountsFromDay1 
    ? {
    labels: Object.values(TrafficLightEnum)
      .filter((
        value: TrafficLightEnum
      ): boolean => value !== TrafficLightEnum.NONE)
      .map((value: TrafficLightEnum): string => value.replace(/_/g, ` `)),
    datasets: [
      {
        backgroundColor: [`green`, `yellow`, `yellow`, `red`, `red`],
        data: Object.values(
          selectedPatientStatsList.trafficLightCountsFromDay1
        ),
      },
    ]} 
    : {};

  const revealVitals = (): void => setState((currentState: any): any => ({
    ...currentState,
    showVitals: true,
    showTrafficLights: false,
  }));

  const revealTrafficLights = (): void => setState((
    currentState: any
  ): any => ({
    ...currentState,
    showVitals: false,
    showTrafficLights: true,
  }));

  return (
    <Grid className={ gridClass } item={ true } xs={ 6 }>
      <Paper className={ paperClass }>
        <Typography variant="h5" component="h3">
          <Icon
            className={ iconClass }
            name="heartbeat"
            size="large"
          />
            Vitals Over Time
          </Typography>
        <Divider />
        <Button.Group className={ classes.buttonGroup }>
          <Button
            active={ showVitals }
            onClick={revealVitals}
          >
            Show Vitals Over Time
          </Button>
          <Button
            active={ showTrafficLights }
            onClick={revealTrafficLights}
          >
            Show Traffic Lights
          </Button>
        </Button.Group>
        <br />
        <br />
        { showVitals && (
          <div>
            <h4 className={classes.noMargin}>Average Vitals Over Time:</h4>
            <Line data={ vitalsOverTime } />
          </div>
        ) }
        { showTrafficLights && (
          <div>
            <h4 className={classes.noMargin}>
              Traffic Lights From All Readings:
            </h4>
            <Bar
              data={ trafficLight }
              options={ {
                legend: { display: false },
                scales: {
                  xAxes: [
                    {
                      ticks: {
                        fontSize: 10,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                      },
                    },
                  ],
                },
              } }
            />
          </div>
        ) }
      </Paper>
    </Grid>
  );
};
