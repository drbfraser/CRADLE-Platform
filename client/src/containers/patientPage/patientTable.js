import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { getPrettyDate, getMomentDate } from '../../utils';

class PatientTable extends Component {
    
    state = {
        columns: [
        {   title: 'Patient Initials',
            field: 'patientName',
            render: rowData => 
                <p key={"initials" + rowData.tableData.id}
                   style={{"fontSize": "200%", "fontWeight" : "bold", "textAlign" : "center"}}
                >{rowData.patientName}</p>,
            headerStyle : {
                textAlign: "center"
            },
            sorting: false
        },
        {   title: 'Patient ID', field: 'patientId' },
        {   title: 'Village No.', field: 'villageNumber'},
        {   title: 'Last Reading',
                render: rowData => <p>{getPrettyDate(this.getLatestReading(rowData.readings))}</p>,
            customSort: (a,b) => getMomentDate(this.getLatestReading(a.readings)).valueOf() - getMomentDate(this.getLatestReading(b.readings)).valueOf(),
            defaultSort: 'desc' }
        ],
        data: [],
        selectedPatient: { patientId: '', patientName: 'Test', 
                        patientSex: 'F', medicalHistory: '',
                        drugHistory: '', villageNumber:'', readings: []
                        }
    }

    getLatestReading = (readings) => {
        let sortedReadings = readings.sort((a,b) => getMomentDate(b.dateTimeTaken).valueOf() - getMomentDate(a.dateTimeTaken).valueOf())
        return sortedReadings[0].dateTimeTaken
    }

    render() {
        
        return (
            <MaterialTable
                title="Patients"
                isLoading={this.props.isLoading}
                columns={this.state.columns}
                data={this.props.data}
                options={{
                    rowStyle: rowData => {
                        return {
                            height: '75px',
                        }
                    },
                    pageSize: 10
                }}
                onRowClick={(e, rowData) => this.props.callbackFromParent(rowData)}
            />
        )
    }
}

export default PatientTable
