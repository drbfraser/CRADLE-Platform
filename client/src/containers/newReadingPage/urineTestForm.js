import React from 'react';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import {Form, Header, Select} from 'semantic-ui-react';

import './index.css'

const resultOptions = [
    { key: 'm', text: '-', value: '-' },
    { key: 'p', text: '+', value: '+' },
    { key: 'pp', text: '++', value: '++' },
    { key: 'ppp', text: '+++', value: '+++' },
]

export const urineTestChemicals = {
    LEUC: 'Leukocytes',
    NIT: 'Nitrites',
    GLU: 'Glucose',
    PRO: 'Protein',
    BLOOD: 'Blood'
}

function UrineTestForm(props) {
    return (
        <Paper className='bpCard' style={{ 'padding': '35px 25px', 'borderRadius': '15px', 'minWidth' : '450px' }}>
            <Header>
                <b>Urine Test</b>
                <Switch
                    className='urineTestSwitch'
                    checked={props.hasUrineTest}
                    onChange={props.onSwitchChange}
                    color='primary'
                />
            </Header>
            {props.hasUrineTest &&
            <div className='urineTest'>
                <Form.Field 
                    name='urineTestLeuc'
                    value={props.reading.urineTest}
                    control={Select}
                    label={urineTestChemicals.LEUC}
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
                <Form.Field
                    name='urineTestNit'
                    value={props.reading.urineTest}
                    control={Select}
                    label={urineTestChemicals.NIT}
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
                <Form.Field 
                    name='urineTestGlu'
                    value={props.reading.urineTest}
                    control={Select}
                    label={urineTestChemicals.GLU}
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
                <Form.Field 
                    name='urineTestPro'
                    value={props.reading.urineTest}
                    control={Select}
                    label={urineTestChemicals.PRO}
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
                <Form.Field 
                    name='urineTestBlood'
                    value={props.reading.urineTest}
                    control={Select}
                    label={urineTestChemicals.BLOOD}
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
            </div>}
        </Paper>
    )
}

export default UrineTestForm