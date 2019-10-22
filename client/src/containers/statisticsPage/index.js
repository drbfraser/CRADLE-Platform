import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';
import { getStatistics } from '../../actions/statistics';
import { Line } from 'react-chartjs-2';
import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea, Statistic
} from 'semantic-ui-react'

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
      backgroundColor: 'rgba(30,144,255,0.4)',
      borderColor: 'rgba(30,144,255,1)',
      pointRadius: 1,
      data: this.props.statisticsList.referralsPerMonth
    }

    const assesmentsPerMonth = {
      label: 'Total Number of Assesments',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(123,204,238,0.4)',
      borderColor: 'rgba(123,204,238,1)',
      pointRadius: 1,
      data: this.props.assesmentsPerMonth
    }

    const referralsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(72,61,139,0.4)',
      borderColor: 'rgba(72,61,139,1)',
      pointRadius: 1,
      data: this.props.statisticsList.referralsPregnantWomenPerMonth
    }

    const assesmentsPregnantWomenPerMonth = {
      label: 'Total Number of Pregnant Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(65,105,255,0.4)',
      borderColor: 'rgba(65,105,255,1)',
      pointRadius: 1,
      data: this.props.statisticsList.assesmentsPregnantWomenPerMonth
    }

    const readings = {
      labels: xLabels,
      datasets: [
        readingsPerMonth
      ]
    }   

    const referralsVsAssesment = {
      labels: xLabels,
      datasets: [
        referralsPerMonth,
        assesmentsPerMonth
      ]
    }

    const referralsVsPregnantWomenReferredVsAssessed = {
      labels: xLabels,
      datasets: [
        referralsPerMonth,
        referralsPregnantWomenPerMonth,
        assesmentsPregnantWomenPerMonth
      ]
    }

    const trafficLight = {
      labels: xLabels,
      datasets: [

      ]
    }

    return (
      <div>
        <h1>Our Health Facility’s Statistics</h1>
        <div className='statisticBox'>
          <div>
            <h2>In the last month, our health facility assessed:</h2>
            <Statistic horizontal label='PEOPLE' value='47' />
            <div className='underline'>  </div>
          </div>
          <div>
            <h2>Number of total cradle readings recorded</h2>
            <Line ref="chart" data={readings} />
          </div>
          <div>
            <h2>Number of referrals made vs number of them that got assessed</h2>
            <Line ref="chart" data={referralsVsAssesment} />
          </div>
          <div>
            <h2>Number of referrals made vs number of pregnant women referred vs number of pregnant women assessed
</h2>
            <Line ref="chart" data={referralsVsPregnantWomenReferredVsAssessed} />
          </div>
          <div>
            <h2>Traffic light</h2>
            <Line ref="chart" data={trafficLight} />
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
