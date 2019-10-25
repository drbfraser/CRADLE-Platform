/**
 * Description: Modal reponsible for the the UI to create and update 
 *      the Follow Up info for Referrals
 * Props:
 *  initialValues [JSON]: initial values of to insert into the form
 *  handleSubmit(state) [required]: function that is called when the user submits form
 *      this function should handle data validation
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button,
    Header, Image, Modal,
    Divider, Form, Select,
    Input, TextArea, Item
  } from 'semantic-ui-react'

export default class FollowUpModal extends Component {
    static propTypes = {
        initialValues: PropTypes.objectOf(PropTypes.string),
        handleSubmit: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)


        this.state = {
            data: {
                followUpAction: "",
                diagnosis: "",
                treatment: ""
            },
            isOpen: false
        }

        if (this.props.initialValues) {
            for (let key in this.state.data) {
                if (key in this.props.initialValues) {
                    this.state.data[key] = this.props.initialValues[key]
                }
            }
        }
    }

    onClose() {}

    onOpen() {}

    handleSelectChange() {

    }

    render() {

        if (this.state.isOpen) {
            return (
                <div>
                    <Modal closeIcon onClose={this.onClose} onOpen={this.onOpen} open={this.state.isOpen}>
                        <Modal.Header>Referral Follow-Up Information</Modal.Header>
                        <Modal.Content scrolling>
                        <Modal.Description>
                            <Header>Follow-Up Information for Patient #{this.state.selectedPatient.patientId}</Header>
                            <Divider />
                            <Form onSubmit={this.handleSubmit}>
                            <Form.Group widths='equal'>
                                <Form.Field
                                name="patientName"
                                // value={this.state.selectedPatient.patientName}
                                control={Input}
                                label='Name'
                                placeholder='Patient Name'
                                onChange={this.handleSelectChange}
                                />
                                <Form.Field
                                name="patientAge"
                                // value={this.state.selectedPatient.patientAge}
                                control={Input}
                                label='Age'
                                placeholder='Patient age'
                                onChange={this.handleSelectChange}
                                />
                                
                            </Form.Group>
                            <Form.Group widths='equal'>
                                <Form.Field
                                name='villageNumber'
                                // value={this.state.selectedPatient.villageNumber}
                                control={Input}
                                label='Village Number'
                                placeholder='Village Number'
                                onChange={this.handleSelectChange}
                                />
                                
                            </Form.Group>
                            <Form.Field
                                name="drugHistory"
                                // value={this.state.selectedPatient.drugHistory || ''}
                                control={TextArea}
                                label='Drug History'
                                placeholder="Patient's drug history..."
                                onChange={this.handleSelectChange}
                            />
                            <Form.Field
                                name="medicalHistory"
                                // value={this.state.selectedPatient.medicalHistory || ''}
                                control={TextArea}
                                label='Medical History'
                                placeholder="Patient's medical history..."
                                onChange={this.handleSelectChange}
                            />
                            <Form.Field control={Button}>Submit</Form.Field>
                            </Form>

                        </Modal.Description>
                        </Modal.Content>
                    </Modal>
                </div>
            )
        } else {
            return (
                <Button>Follow Up</Button>
            )
        }
    }
}
