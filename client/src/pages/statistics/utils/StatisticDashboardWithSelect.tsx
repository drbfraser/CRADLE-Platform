import { Statistic } from 'semantic-ui-react';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Bar } from 'react-chartjs-2';
import { Toast } from 'src/shared/components/toast';
import { initialData, initialColorReading } from '.';
import { useEffect } from 'react';

interface IProps {
  getData: () => Promise<any>;
  select: string | undefined;
  message: string;
  from: Date;
  to: Date;
}

export const StatisticDashboardWithSelect: React.FC<IProps> = ({
  getData,
  select,
  message,
  from,
  to,
}) => {
  const classes = useStyles();

  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loaded, setloaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    if (select !== undefined) {
      getData()
        .then((response) => {
          setData(response);
          setColorReading(response);
          setloaded(true);
        })
        .catch((err) => {
          setErrorLoading(true);
        });
    }
  }, [getData, select, from, to]);

  const barData = {
    labels: ['Green', 'Yellow Up', 'Yellow Down', 'Red Up', 'Red Down'],
    datasets: [
      {
        label: 'Traffic Light',
        data: [
          colorReading.color_readings.GREEN,
          colorReading.color_readings.YELLOW_UP,
          colorReading.color_readings.YELLOW_DOWN,
          colorReading.color_readings.RED_UP,
          colorReading.color_readings.RED_DOWN,
        ],
        backgroundColor: [
          '#289672',
          '#ffefa1',
          '#ffcb91',
          '#f05454',
          '#af2d2d',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    legend: {
      labels: {
        fontColor: 'black',
      },
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message={message}
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      {loaded && (
        <div className={classes.center}>
          <Statistic.Group className={classes.statisticGroup}>
            {data.patients_referred !== undefined && (
              <Statistic horizontal className={classes.statistic}>
                <Statistic.Value>{data.patients_referred}</Statistic.Value>
                <Statistic.Label className={classes.verticalWriting}>
                  Patient Referred
                </Statistic.Label>
              </Statistic>
            )}

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.days_with_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Days With Readings
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.sent_referrals}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Referrals Sent
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.total_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Total Readings
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.unique_patient_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Unique Patient Readings
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <br />

          <h2>Traffic lights</h2>
          <div className={classes.chart}>
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    margin: 'auto',
  },
  statisticGroup: {
    paddingBlockEnd: `${theme.spacing(2)}px`,
  },
  chart: {
    margin: 'auto',
    width: `75%`,
    height: '50%',
  },
  statistic: {
    width: 230,
    height: 100,
    padding: theme.spacing(1, 0, 1, 2),
    border: `1px solid rgb(211, 205, 205)`,
    borderRadius: 7,
    boxShadow: `3px 1px rgb(211, 205, 205)`,
  },
  verticalWriting: {
    width: 100,
    margin: theme.spacing(0, `auto`),
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
}));
