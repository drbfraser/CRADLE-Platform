import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';
import { Line } from 'react-chartjs-2';
import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea, Statistic
} from 'semantic-ui-react'

import './index.css'
import newReadingPage from '../newReadingPage';

class StatisticsPage extends Component {
  state = { 
    readingData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'My First dataset',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointRadius: 1,
          data: [65, 59, 80, 81, 56, 55, 40, 50]
        },
        {
          label: 'My Second dataset',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(30,144,255,0.4)',
          borderColor: 'rgba(30,144,255,1)',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(30,144,255,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointRadius: 1,
          data: [55, 50, 65, 60, 68, 72, 84]
        }
      ]
    },
    referralData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'My First dataset',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointRadius: 1,
          data: [65, 59, 80, 81, 56, 55, 40, 50]
        }
      ]
    }
  }

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get statistics
        return
      }
      // this.props.getStatistics()
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
            <Line ref="chart" data={this.state.readingData} />
          </div>
          <div>
            <h2>Number of referrals made vs number of them that got assessed</h2>
            <Line ref="chart" data={this.state.referralData} />
          </div>
          <div>
            <h2>Number of referrals made vs number of pregnant women referred vs number of pregnant women assessed
</h2>
            <Line ref="chart" data={this.state.readingData} />
          </div>
          <div>
            <h2>Traffic light</h2>
            <Line ref="chart" data={this.state.readingData} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatisticsPage)
