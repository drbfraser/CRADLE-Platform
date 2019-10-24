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

    const readingsPerMonth = {
      label: 'Total Number of Readings',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: this.props.statisticsList.readingsPerMonth
    }

    const referralsPerMonth = {
      label: 'Total Number of Referrals',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: this.props.statisticsList.referralsPerMonth
    }

    const assessmentsPerMonth = {
      label: 'Total Number of Assesments',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.assessmentsPerMonth
    }

    const referralsWomenPerMonth = {
      label: 'Total Number of Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(21,21,43,0.4)',
      borderColor: 'rgba(21,21,43,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenReferralsPerMonth
    }

    const referralsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: this.props.statisticsList.referralsPregnantWomenPerMonth
    }

    const assessmentsWomenPerMonth = {
      label: 'Total Number of Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenAssessedPerMonth
    }

    const assessmentsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.assessmentsPregnantWomenPerMonth
    }

    const readingsVsReferralsVsAssessment = {
      labels: xLabels,
      datasets: [
        readingsPerMonth,
        referralsPerMonth,
        assessmentsPerMonth
      ]
    }   

    const womenReferralsVsAssessed = {
      labels: xLabels,
      datasets: [
        referralsWomenPerMonth,
        referralsPregnantWomenPerMonth,
        assessmentsWomenPerMonth,
        assessmentsPregnantWomenPerMonth
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
            {(this.props.statisticsList.readingsPerMonth 
            && this.props.statisticsList.referralsPerMonth 
            && this.props.statisticsList.assessmentsPerMonth) ? (
              <Statistic.Group>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlineBlue'>{this.props.statisticsList.readingsPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>READINGS TAKEN</Statistic.Label>
                </Statistic>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlinePurple'>{this.props.statisticsList.referralsPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>REFERRALS SENT</Statistic.Label>
                </Statistic>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlineOrange'>{this.props.statisticsList.assessmentsPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>ASSESSMENTS MADE</Statistic.Label>
                </Statistic>
            </Statistic.Group>
            ) : (<div></div>)
            }
            <br/>
            <Line ref="chart" className='chartBox' data={readingsVsReferralsVsAssessment}/>
          </div>
          <br/>
          <div>
            <h2>A snapshot of all women assessed:</h2>
            {(this.props.statisticsList.womenReferralsPerMonth 
            && this.props.statisticsList.referralsPregnantWomenPerMonth
            && this.props.statisticsList.womenAssessedPerMonth
            && this.props.statisticsList.assessmentsPregnantWomenPerMonth) ? (
              <Statistic.Group>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlineBlack'>{this.props.statisticsList.womenReferralsPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>WOMEN REFERRED</Statistic.Label>
                </Statistic>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlineBlue'>{this.props.statisticsList.referralsPregnantWomenPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>PREGNANT WOMEN REFERRED</Statistic.Label>
                </Statistic>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlinePurple'>{this.props.statisticsList.womenAssessedPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>WOMEN ASSESSED</Statistic.Label>
                </Statistic>
                <Statistic horizontal className='statSubBox'>
                  <Statistic.Value className='underlineOrange'>{this.props.statisticsList.assessmentsPregnantWomenPerMonth[getMonth-1]}</Statistic.Value>
                  <Statistic.Label className='virticalWritting'>PREGNANT WOMEN ASSESSED</Statistic.Label>
                </Statistic>
            </Statistic.Group>
            ) : (<div></div>)
            }
            
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
