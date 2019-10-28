import React, {Component} from 'react';
import MaterialTable from 'material-table';
import moment from 'moment';

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
                render: rowData => <p>{this.getPrettyDate(this.getLatestReading(rowData.readings))}</p>,
            customSort: (a,b) => this.getMomentDate(this.getLatestReading(a.readings)).valueOf() - this.getMomentDate(this.getLatestReading(b.readings)).valueOf(),
            defaultSort: 'desc' }
        ],
        data: [],
        selectedPatient: { patientId: '', patientName: 'Test', 
                        patientSex: 'F', medicalHistory: '',
                        drugHistory: '', villageNumber:'', readings: []
                        }
    }

    getLatestReading = (readings) => {
        let sortedReadings = readings.sort((a,b) => this.getMomentDate(b.dateTimeTaken).valueOf() - this.getMomentDate(a.dateTimeTaken).valueOf())
        return sortedReadings[0].dateTimeTaken
    }

    getPrettyDate = (dateStr) => {
        return this.getMomentDate(dateStr).format("MMMM Do, YYYY");
    }

    getMomentDate = (dateStr) => {
        var dateStr = dateStr.slice(0,19)
        return moment(dateStr);
    }

    render() {
        
        return (
            <MaterialTable
                title="Patients Table"
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
