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
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button,
    Header, Image, Modal,
    Divider, Form, Select,
    Input, TextArea, Item
  } from 'semantic-ui-react'

import { updateFollowUp, setReadingId, createFollowUp } from '../../actions/referrals';

class FollowUpModal extends Component {
    static propTypes = {
        initialValues: PropTypes.objectOf(PropTypes.string),
        updateFollowUp: PropTypes.func.isRequired,
        referralId: PropTypes.string.isRequired,
        readingId: PropTypes.string.isRequired
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

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.loadInitialValues = this.loadInitialValues.bind(this);

        this.loadInitialValues();
    }

    loadInitialValues() {
        if (this.props.initialValues) {
            for (let key in this.state.data) {
                if (key in this.props.initialValues) {
                    this.state.data[key] = this.props.initialValues[key]
                }
            }
        }
    }

    handleOpen() {
        this.setState({
            isOpen: true
        }, () => {
            this.loadInitialValues();
            this.setState(this.state);
        })
    }

    handleClose() {
        this.setState({
            isOpen: false
        })
    }

    onOpen() {
        console.log("on open")
        this.props.setReadingId(this.props.readingId)
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
        this.state.data.referral = this.props.referralId
        console.log("handle submit state data:  ", this.state.data);
        
        // update existing followUpInfo
        if (this.props.initialValues) {
            this.props.updateFollowUp(this.props.initialValues['id'], this.state.data);
        } else { // create new followUpInfo
            this.props.createFollowUp(this.state.data);
        }
        
        this.handleClose();
    }

    render() {
        // console.log("followUpModal state: ", this.state)
        return (
            <div>
                <Modal 
                    trigger={
                        <Button 
                            style={{"backgroundColor" : "#84ced4"}} 
                            size="large" 
                            onClick={this.handleOpen}>
                                {this.props.initialValues ? (
                                    "Update Assessment"
                                ) : (
                                    "Assess"
                                )}
                        </Button>
                    }
                    onClose={this.handleClose}
                    onOpen={this.onOpen}
                    open={this.state.isOpen}
                    closeIcon
                >
                    <Modal.Header>Referral Follow-Up Information</Modal.Header>
                    <Modal.Content scrolling>
                    <Modal.Description>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field
                                name="followUpAction"
                                value={this.state.data.followUpAction || ''}
                                control={TextArea}
                                label='Follow Up Action'
                                placeholder="Patient's action performed for this follow up"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field
                                name="diagnosis"
                                value={this.state.data.diagnosis || ''}
                                control={TextArea}
                                label='Diagnosis'
                                placeholder="Medical diagnosis of the cause of their chief complaint"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field
                                name="treatment"
                                value={this.state.data.treatment || ''}
                                control={TextArea}
                                label='Treatment'
                                placeholder="Treatment performed on patient to remedy their chief complaint"
                                onChange={this.handleChange}
                                required
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

const mapStateToProps = ({}) => ({})
  
const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            updateFollowUp,
            createFollowUp,
            setReadingId
        },
            dispatch
    )

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FollowUpModal)
