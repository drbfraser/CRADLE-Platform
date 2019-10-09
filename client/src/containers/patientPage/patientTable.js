import React, {Component} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';

// const useStyles = makeStyles(theme => ({
//     initials: { fontSize : '62.5%'}
// }));

// const classes = useStyles();

class PatientTable extends Component {
    
    state = {
        columns: [
        {   title: 'Patient Initials',
            field: 'patientName',
            render: rowData => 
                <p key={"initials" + rowData.tableData.id}
                   style={{"font-size": "200%", "fontWeight" : "bold", "textAlign" : "center"}}
                >{rowData.patientName}</p>,
            headerStyle : {
                textAlign: "center"
            }
        },
        {   title: 'Patient ID', field: 'patientId', defaultSort: 'asc' },
        {   title: 'Village No.', field: 'villageNumber'},
        {   title: 'Last Reading', field: 'followUp',
                render: rowData => rowData.readings ? (<p>{rowData.readings[0].dateTimeTaken}</p>) : (<p>Not needed</p>) },
        ],
        data: [],
        selectedPatient: { patientId: '', patientName: 'Test', 
                        patientSex: 'F', medicalHistory: '',
                        drugHistory: '', villageNumber:'', readings: []
                        }
  }

  render() {

    return (
        <MaterialTable
            title="Patients Table"
            columns={this.state.columns}
            data={this.props.data}
            options={{
                rowStyle: rowData => {
                    return {
                        height: '75px',
                        // backgroundColor: rowData.tableData.id % 2 === 0 ? "#FFF" : "#F0F0F0",
                    }
                }
            }}
            onRowClick={(e, rowData) => this.props.callbackFromParent(rowData)}
        />
    )
  }
}

export default PatientTable
