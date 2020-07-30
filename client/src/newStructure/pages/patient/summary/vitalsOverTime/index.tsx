import { Action, actionCreators } from '../reducers';
import { Bar, Line } from 'react-chartjs-2';
import { Button, Divider } from 'semantic-ui-react';

import { Content } from './content';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPatientStatistics } from '../../../../redux/reducers/patientStatistics';
import { useDispatch } from 'react-redux';
import { useStyles } from './styles';
import { useTrafficLights } from './hooks/trafficLights';
import { useVitals } from './hooks/vitals';

interface IProps {
  patientId: string;
  showingVitals: boolean;
  showingTrafficLights: boolean;
  updateState: React.Dispatch<Action>;
}

export const VitalsOverTime: React.FC<IProps> = ({
  patientId,
  showingVitals,
  showingTrafficLights,
  updateState,
}) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  React.useEffect((): void => {
    dispatch(getPatientStatistics(patientId));
  }, [dispatch, patientId]);

  const showVitals = (): void => {
    updateState(actionCreators.showVitals());
  };

  const showTrafficLights = (): void => {
    updateState(actionCreators.showTrafficLights());
  };

  const vitals = useVitals();

  const trafficLights = useTrafficLights();

  return (
    <Grid className={classes.container} item={true} xs={6}>
      <Paper className={classes.paper}>
        <Typography className={classes.title} variant="h5" component="h3">
          <FavoriteIcon fontSize="large" />
          Vitals Over Time
        </Typography>
        <Divider />
        <div className={classes.buttonGroupContainer}>
          <Button.Group className={classes.buttonGroup}>
            <Button active={showingVitals} onClick={showVitals}>
              Show Vitals Over Time
            </Button>
            <Button active={showingTrafficLights} onClick={showTrafficLights}>
              Show Traffic Lights
            </Button>
          </Button.Group>
        </div>
        <Content>
          {showingVitals && (
            <div>
              <h4 className={classes.heading}>Average Vitals Over Time:</h4>
              <Line data={vitals} />
            </div>
          )}
          {showingTrafficLights && (
            <div>
              <h4 className={classes.heading}>
                Traffic Lights From All Readings:
              </h4>
              <Bar
                data={trafficLights}
                options={{
                  legend: {
                    display: false,
                  },
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
                }}
              />
            </div>
          )}
        </Content>
      </Paper>
    </Grid>
  );
};
