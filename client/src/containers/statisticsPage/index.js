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
  readingsPerMonth = {
    label: 'Total Number of Readings',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderColor: 'rgba(75,192,192,1)',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointRadius: 1,
    data: this.props.statistics.readingsPerMonth
  }

  referralsPerMonth = {
    label: 'Total Number of Referrals',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderColor: 'rgba(75,192,192,1)',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointRadius: 1,
    data: this.props.statistics.referralsPerMonth
  }

  assesmentsPerMonth = {
    label: 'Total Number of Assesments',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderColor: 'rgba(75,192,192,1)',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointRadius: 1,
    data: this.props.statistics.assesmentsPerMonth
  }

  referralsPregnantWomenPerMonth = {
    label: 'Total Number of Pregnant Women Referred',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderColor: 'rgba(75,192,192,1)',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointRadius: 1,
    data: this.props.statistics.referralsPregnantWomenPerMonth
  }

  assesmentsPregnantWomenPerMonth = {
    label: 'Total Number of Pregnant Women Assessed',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(75,192,192,0.4)',
    borderColor: 'rgba(75,192,192,1)',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointRadius: 1,
    data: this.props.statistics.assesmentsPregnantWomenPerMonth
  }

  xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  state = { 
    readings: {
      labels: this.xLabels,
      datasets: [
        this.readingsPerMonth
      ]
    },
    referralsVsAssesment: {
      labels: this.xLabels,
      datasets: [
        this.referralsPerMonth,
        this.assesmentsPerMonth
      ]
    },
    referralsVsPregnantWomenReferredVsAssessed: {
      labels: this.xLabels,
      datasets: [
        this.referralsPerMonth,
        this.referralsPregnantWomenPerMonth,
        this.assesmentsPregnantWomenPerMonth
      ]
    },
    trafficLight: {
      labels: this.xLabels,
      datasets: [

      ]
    }
  }

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

    return (
      <div>
        <h1>Statistics Page</h1>
        <div className='statisticBox'>
          {/* <div>
            <Statistic horizontal label='Patients' value='0' />
          </div> */}
          <div>
            <h2>Number of total cradle readings recorded</h2>
            <Line ref="chart" data={this.state.readings} />
          </div>
          <div>
            <h2>Number of referrals made vs number of them that got assessed</h2>
            <Line ref="chart" data={this.state.referralsVsAssesment} />
          </div>
          <div>
            <h2>Number of referrals made vs number of pregnant women referred vs number of pregnant women assessed
</h2>
            <Line ref="chart" data={this.state.referralsVsPregnantWomenReferredVsAssessed} />
          </div>
          <div>
            <h2>Traffic light</h2>
            <Line ref="chart" data={this.state.trafficLight} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ state }) => ({
    user : state.user.currentUser,
    statistics: state.statistics
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
