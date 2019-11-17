import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';

import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea, Icon
} from 'semantic-ui-react'

import './index.css'

class NewReadingPage extends Component {
  state = { }

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
      <div >
        <h1>Create a new:</h1>
        <div className='centerize'>
          <div>
            <Button icon labelPosition='left' className='buttonStyle'>
              <Icon bordered name='user plus' size='big' color='vlack'/>
              <div className='patientText'>PATIENT</div>
            </Button>
          </div>
          <Divider horizontal>OR</Divider>
          <div>
            <Button icon labelPosition='left' className='buttonStyle'>
              <div className='iconBgStyle'>
                <Icon.Group size='big' bordered className='iconStyle'>
                  <Icon name='heart' color='balck'/>
                  <Icon corner name='add' color='color'/>
                </Icon.Group>
              </div>
              <div className='reading'>READING</div>
              <div className='exitPatient'>EXISTING PATIENT</div>
            </Button>
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
)(NewReadingPage)
