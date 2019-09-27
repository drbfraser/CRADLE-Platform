import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';
import { getPosts } from '../../actions/posts';


class PatientPage extends Component {
  state = {
    columns: [
      { title: 'Patient ID', field: 'patientId' },
      { title: 'Patient Name', field: 'patientName' },
      { title: 'Patient Sex', field: 'patientSex' },
      { title: 'Pregant', field: 'isPregnant', type: 'boolean' },
    ],
    data: [],
  }


  componentDidMount = () => {
    console.log('componentDidMount')
    this.props.getCurrentUser().then(() => {
      this.props.getPatients()
    })
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
        <div >
          <h1>Patients List</h1>
          <p> only logged in users are allowed to see this </p>
          <MaterialTable
            title="Patients Table"
            columns={this.state.columns}
            data={this.props.data}
            editable={{
              onRowAdd: newData =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data.push(newData);
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data[data.indexOf(oldData)] = newData;
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
              onRowDelete: oldData =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data.splice(data.indexOf(oldData), 1);
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
            }}
          />
        </div>

    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients : patients,
  data : patients.patientsList,
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getPatients,
      getCurrentUser,
      getPosts
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientPage)
