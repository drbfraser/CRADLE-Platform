import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';
import { getStatistics } from '../../actions/statistics';
import { Bar, Line } from 'react-chartjs-2';
import { Statistic } from 'semantic-ui-react'

import './index.css'

class StatisticsPage extends Component {

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get statistics
        return
      }
      this.props.getStatistics()
      
    })
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const trafficLightLabels = ['GREEN', 'YELLOW UP', 'YELLOW DOWN', 'RED UP', 'RED DOWN']

    var getDate = new Date();
    var getMonth = getDate.getMonth();

    const readings = this.props.statisticsList.readingsPerMonth
    var readingArray = []
    for (var i in readings) {
      readingArray.push(readings[i])
    }

    const readingsPerMonth = {
      label: 'Total Number of Readings',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: readings
    }

    const referrals = this.props.statisticsList.referralsPerMonth
    var referralsArray = []
    for (var i in referrals) {
      referralsArray.push(referrals[i])
    }

    const referralsPerMonth = {
      label: 'Total Number of Referrals',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: referrals
    }

    const assesment = this.props.statisticsList.assesmentsPerMonth
    var assesmentArray = []
    for (var i in assesment) {
      assesmentArray.push(assesment[i])
    }

    const assesmentsPerMonth = {
      label: 'Total Number of Assesments',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: assesment
    }

    const referralsWomen = this.props.statisticsList.referralsWomenPerMonth
    var referralsWomenArray = []
    for (var i in referralsWomen) {
      referralsWomenArray.push(referralsWomen[i])
    }

    const referralsWomenPerMonth = {
      label: 'Total Number of Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(21,21,43,0.4)',
      borderColor: 'rgba(21,21,43,1)',
      pointRadius: 1,
      data: referralsWomen
    }

    const referralsPregnantWomen = this.props.statisticsList.referralsPregnantWomenPerMonth
    var referralsPregnantWomenArray = []
    for (var i in referralsPregnantWomen) {
      referralsPregnantWomenArray.push(referralsPregnantWomen[i])
    }

    const referralsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: referralsPregnantWomen
    }

    const assesmentsWomen = this.props.statisticsList.assesmentsWomenPerMonth
    var assesmentsWomenArray =[]
    for (var i in assesmentsWomen) {
      assesmentsWomenArray.push(assesmentsWomen[i])
    }

    const assesmentsWomenPerMonth = {
      label: 'Total Number of Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: assesmentsWomen
    }

    const assesmentsPregnantWomen = this.props.statisticsList.assesmentsPregnantWomenPerMonth
    var assesmentsPregnantWomenArray =[]
    for (var i in assesmentsPregnantWomen) {
      assesmentsPregnantWomenArray.push(assesmentsPregnantWomen[i])
    }

    const assesmentsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.assesmentsPregnantWomenPerMonth
    }

    const readingsVsReferralsVsAssesment = {
      labels: xLabels,
      datasets: [
        readingsPerMonth,
        referralsPerMonth,
        assesmentsPerMonth
      ]
    }   

    const womenReferralsVsAssessed = {
      labels: xLabels,
      datasets: [
        referralsWomenPerMonth,
        referralsPregnantWomenPerMonth,
        assesmentsWomenPerMonth,
        assesmentsPregnantWomenPerMonth
      ]
    }

    var trafficLight = {
      labels: trafficLightLabels,
      datasets: [{
        backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'],
        data: [5,4,3,2,1]
      }]
    }

    return (
      <div>
        <div className='statisticBox'>
          <h1 className='headerSize'>Our Health Facility’s Statistics</h1>
          <div>
            <h2>In the last month, our health facility assessed:</h2>
            <Statistic.Group>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlue'>47</Statistic.Value>
                <Statistic.Label>PEOPLE</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlue'>26</Statistic.Value>
                <Statistic.Label>WOMEN</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlue'>200</Statistic.Value>
                <Statistic.Label className='virticalWritting'>PREGNANT WOMEN</Statistic.Label>
              </Statistic>
            </Statistic.Group>
          </div>
          <br/>
          <br/>
          <h1 className='headerSize'>Global Statistics</h1>
          <div>
            <h2>In the last month, there were:</h2>
            <Statistic.Group>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlue'>{readingArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>READINGS TAKEN</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlinePurple'>{referralsArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>REFERRALS SENT</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineOrange'>{assesmentArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>ASSESSMENTS MADE</Statistic.Label>
              </Statistic>
            </Statistic.Group>
            <br/>
            <Line ref="chart" className='chartBox' data={readingsVsReferralsVsAssesment}/>
          </div>
          <br/>
          <div>
            <h2>A snapshot of all women assessed:</h2>
            <Statistic.Group>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlack'>{referralsWomenArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>WOMEN REFERRED</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineBlue'>{referralsPregnantWomenArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>PREGNANT WOMEN REFERRED</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlinePurple'>{assesmentsWomenArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>WOMEN ASSESSED</Statistic.Label>
              </Statistic>
              <Statistic horizontal className='statSubBox'>
                <Statistic.Value className='underlineOrange'>{assesmentsPregnantWomenArray[getMonth-1]}</Statistic.Value>
                <Statistic.Label className='virticalWritting'>PREGNANT WOMEN ASSESSED</Statistic.Label>
              </Statistic>
            </Statistic.Group>
            <br/>
            <Line ref="chart" className='chartBox' data={womenReferralsVsAssessed} />
          </div>
          <br/>
          <div>
            <h2>Traffic lights from last month:</h2>
            <Bar ref="chart" className='chartBox' data={trafficLight} options={{legend: {display: false}, scales: {yAxes: [{ticks: {beginAtZero: true}}]}}} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user, statistics }) => ({
    user : user.currentUser,
    statisticsList: statistics.statisticsList
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
      getStatistics,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatisticsPage)
