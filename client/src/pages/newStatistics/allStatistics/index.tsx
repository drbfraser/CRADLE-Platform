import React from 'react'
import { Statistic } from 'semantic-ui-react'
import {Doughnut} from 'react-chartjs-2';


const data = {
  labels: [
    'Red UP',
    'Red DOWN',
    'Green',
    'Yellow UP',
    'Yellow DOWN'
  ],
  datasets: [{
    data: [30, 50, 10, 50, 30],
    backgroundColor: [
    '#FF6384',
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FFCE56'
    ],
    hoverBackgroundColor: [
    '#FF6384',
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FFCE56'
    ]
  }]
};


export default function AllStatistics() {
  return (
    <div>
      <h2>During this period, all facilities and users has: </h2>
      <Statistic>
        <Statistic.Value>0</Statistic.Value>
        <Statistic.Label>Referred patients</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>0</Statistic.Value>
        <Statistic.Label>Referrals</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>0</Statistic.Value>
        <Statistic.Label>Days with readings</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>0</Statistic.Value>
        <Statistic.Label>Unique patient readings</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>0</Statistic.Value>
        <Statistic.Label>Total reading</Statistic.Label>
      </Statistic>
      
      <h2>Traffic lights during this period</h2>
      <Doughnut data={data} />

    </div>
  )
}

