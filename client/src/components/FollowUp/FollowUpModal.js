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
        handleSubmit: PropTypes.func.isRequired,
        handleClose: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            data: {
                followUpAction: "",
                diagnosis: "",
                treatment: ""
            }
        }

        if (this.props.initialValues) {
            for (let key in this.state.data) {
                if (key in this.props.initialValues) {
                    this.state.data[key] = this.props.initialValues[key]
                }
            }
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
    }

    onClose() {

    }

    onOpen() {
        this.setState({

        })
    }

    handleChange(e, value) {
        this.setState({
            'data': {
                ...this.state.data,
                [value.name]: value.value
            }
        })
    }

    handleSubmit() {
        console.log("submitting follow up info");
        console.log("handle submit state:  " + this.state);
    }

    render() {
        console.log("followUpModal state: ", this.state)
        return (
            <div>
                <Modal closeIcon onClose={this.props.handleClose} onOpen={this.onOpen} open={this.props.isOpen}>
                    <Modal.Header>Referral Follow-Up Information</Modal.Header>
                    <Modal.Content scrolling>
                    <Modal.Description>
                        <Form onSubmit={this.props.handleSubmit}>
                            <Form.Field
                                name="followUpAction"
                                value={this.state.data.followUpAction || ''}
                                control={TextArea}
                                label='Follow Up Action'
                                placeholder="Patient's action performed for this follow up"
                                onChange={this.handleChange}
                            />
                            <Form.Field
                                name="diagnosis"
                                value={this.state.data.diagnosis || ''}
                                control={TextArea}
                                label='Diagnosis'
                                placeholder="Medical diagnosis of the cause of their chief complaint"
                                onChange={this.handleChange}
                            />
                            <Form.Field
                                name="treatment"
                                value={this.state.data.treatment || ''}
                                control={TextArea}
                                label='Treatment'
                                placeholder="Treatment performed on patient to remedy their chief complaint"
                                onChange={this.handleChange}
                            />
                            <Form.Field control={Button}>Submit</Form.Field>
                        </Form>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}
