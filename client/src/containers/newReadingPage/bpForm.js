import React from 'react';
import Paper from '@material-ui/core/Paper';
import {
    Form, Header, Divider,
    Select, Input, TextArea,
} from 'semantic-ui-react';

import './index.css'

function BpForm(props) {
    return (
        <Paper className='bpCard' style={{ "padding": "35px 25px", "borderRadius": "15px" }}>
            <Form className='centerize'>
                <Header><b>Blood Pressure</b></Header>
                <div className='bpField'>
                    <Form.Field
                        inline
                        name="bpSystolic"
                        value={props.reading.bpSystolic}
                        control={Input}
                        label='Systolic:'
                        onChange={props.onChange}
                    />
                    <Form.Field
                        inline
                        name="bpDiastolic"
                        value={props.reading.bpDiastolic}
                        control={Input}
                        label='Diastolic:'
                        onChange={props.onChange}
                    />
                    <Form.Field
                        inline
                        name="heartRateBPM"
                        value={props.reading.heartRateBPM}
                        control={Input}
                        label='Heart rate:'
                        onChange={props.onChange}
                    />
                </div>
            </Form>
        </Paper>
    )
}

export default BpForm