import { Statistic } from 'semantic-ui-react';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Data, ColorReading } from '../utils';
// import { StatisticCard } from './StatisticCard';
import { Bar } from 'react-chartjs-2';

interface IProps {
  data: Data;
  colorReading: ColorReading;
}

export const StatisticDashboard: React.FC<IProps> = ({
  data,
  colorReading,
}) => {
  const classes = useStyles();

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
          '#36A2EB',
          '#FFCE56',
          '#FFCE56',
          '#FF6384',
          '#FF6384',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    legend: {
      labels: {
        // This more specific font property overrides the global property
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
      <div className={classes.center}>
        <Statistic.Group className={classes.statisticGroup}>
          <Statistic horizontal className={classes.statistic}>
            <Statistic.Value>{data.patients_referred}</Statistic.Value>
            <Statistic.Label className={classes.verticalWriting}>
              Patient Referred
            </Statistic.Label>
          </Statistic>

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

        <h2>Traffic lights during this period</h2>
        <div className={classes.chart}>
          <Bar data={barData} options={options} />
        </div>
      </div>
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

{
  /* <StatisticCard
data={data.patients_referred}
label="Patient Referred"
/>
<StatisticCard
data={data.days_with_readings}
label="Days With Readings"
/>
<StatisticCard data={data.sent_referrals} label="Referrals Sent" />
<StatisticCard data={data.total_readings} label="Total Readings" />
<StatisticCard
data={data.unique_patient_readings}
label="Unique Patient Readings"
/> */
}
