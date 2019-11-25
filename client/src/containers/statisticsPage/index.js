import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';
import { getStatistics } from '../../actions/statistics';
import { Bar, Line } from 'react-chartjs-2';
import { Card, Statistic } from 'semantic-ui-react'

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

    const womenReferredPerMonth = {
      label: 'Total Number of Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(21,21,43,0.4)',
      borderColor: 'rgba(21,21,43,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenReferredPerMonth
    }

    const pregnantWomenReferredPerMonth = {
      label: 'Total Number of Pregnant Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: this.props.statisticsList.pregnantWomenReferredPerMonth
    }

    const womenAssessedPerMonth = {
      label: 'Total Number of Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenAssessedPerMonth
    }

    const pregnantWomenAssessedPerMonth = {
      label: 'Total Number of Pregnant Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.pregnantWomenAssessedPerMonth
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
        womenReferredPerMonth,
        pregnantWomenReferredPerMonth,
        womenAssessedPerMonth,
        pregnantWomenAssessedPerMonth
      ]
    }

    var trafficLight = {}
    if(this.props.statisticsList.trafficLightStatusLastMonth) {
      trafficLight = {
        labels: trafficLightLabels,
        datasets: [{
          backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'],
          data: Object.values(this.props.statisticsList.trafficLightStatusLastMonth)
        }]
      }
    }
  
    return (
      <div>
        <div className='statisticBox'>
          <h1 className='headerSize'>Our Health Facility’s Statistics</h1>
          <div>
            <h2>In the last month, our health facility assessed:</h2>
            <div className='centerize'>
              {(this.props.statisticsList.uniquePeopleAssesedPerMonth
              || this.props.statisticsList.womenAssessedPerMonth
              || this.props.statisticsList.pregnantWomenAssessedPerMonth) ? (
                <Statistic.Group style={{marginLeft: "auto", marginRight: "auto"}}>

                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineBlue'>{this.props.statisticsList.uniquePeopleAssesedPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label>PEOPLE</Statistic.Label>
                  </Statistic>

                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineBlue'>{this.props.statisticsList.womenAssessedPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label>WOMEN</Statistic.Label>
                  </Statistic>
                    
                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineBlue'>{this.props.statisticsList.pregnantWomenAssessedPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label className='virticalWritting'>PREGNANT WOMEN</Statistic.Label>
                  </Statistic>

                </Statistic.Group>
              ) : (<div></div>)
              }
            </div>
          </div>
          <br/>
          <br/>
          <h1 className='headerSize'>Global Statistics</h1>
          <div>
            <h2>In the last month, there were:</h2>
            <div className='centerize'>
              {(this.props.statisticsList.readingsPerMonth 
              && this.props.statisticsList.referralsPerMonth 
              && this.props.statisticsList.assessmentsPerMonth) ? (
                <Statistic.Group style={{marginLeft: "auto", marginRight: "auto", paddingBottom: 20}}>

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
              <div className='chartBox'>
                <Card fluid><Card.Content>
                  <Line ref="chart" data={readingsVsReferralsVsAssessment}/>
                </Card.Content></Card>
              </div>
            </div>
            <br/>
          </div>
          <br/>
          <br/>
          <div>
            <h2>A snapshot of all women assessed:</h2>
            <div className='centerize'>
              {(this.props.statisticsList.womenReferredPerMonth 
              && this.props.statisticsList.pregnantWomenReferredPerMonth
              && this.props.statisticsList.womenAssessedPerMonth
              && this.props.statisticsList.pregnantWomenAssessedPerMonth) ? (
                <Statistic.Group style={{marginLeft: "auto", marginRight: "auto", paddingBottom: 20}}>
                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineBlack'>{this.props.statisticsList.womenReferredPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label className='virticalWritting'>WOMEN REFERRED</Statistic.Label>
                  </Statistic>
                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineBlue'>{this.props.statisticsList.pregnantWomenReferredPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label className='virticalWritting'>PREGNANT WOMEN REFERRED</Statistic.Label>
                  </Statistic>
                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlinePurple'>{this.props.statisticsList.womenAssessedPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label className='virticalWritting'>WOMEN ASSESSED</Statistic.Label>
                  </Statistic>
                  <Statistic horizontal className='statSubBox'>
                    <Statistic.Value className='underlineOrange'>{this.props.statisticsList.pregnantWomenAssessedPerMonth[getMonth-1]}</Statistic.Value>
                    <Statistic.Label className='virticalWritting'>PREGNANT WOMEN ASSESSED</Statistic.Label>
                  </Statistic>
              </Statistic.Group>
              ) : (<div></div>)
              }
              <br/>
              <div className='chartBox'> 
              <Card fluid>
                <Card.Content>
                  <Line ref="chart" data={womenReferralsVsAssessed} />
                </Card.Content>
              </Card>
              </div>
            </div>
          </div>
          <br/>
          <br/>
          <div>
            <h2 className='setBottomHeight'>Traffic lights from last month:</h2>
            <br/>
            <div className='centerize'>
              <div className='chartBox'>
                <Card fluid>
                  <Card.Content>
                    <Bar ref="chart" data={trafficLight} options={{legend: {display: false}, scales: {yAxes: [{ticks: {beginAtZero: true}}]}}} />
                  </Card.Content>
                </Card>
              </div>
            </div>
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
