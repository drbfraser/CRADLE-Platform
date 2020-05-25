/**
 * Description: Modal reponsible for the the UI to create and update
 *      the Follow Up info for Referrals
 * Props:
 *  initialValues [JSON]: initial values of to insert into the form
 *  handleSubmit(state) [required]: function that is called when the user submits form
 *      this function should handle data validation
 */

import { Button, Modal } from 'semantic-ui-react';
import {
  createFollowUp,
  setReadingId,
  updateFollowUp,
} from '../../../../../../reducers/referrals';

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { initialState } from './utils';
import { Content } from './content';
import classes from './styles.module.css';

interface IProps {
  initialValues: { [key: string]: string },
  updateFollowUp: any,
  referralId: string,
  readingId: string,
  setReadingId: any,
  createFollowUp: any,
}

export interface IState {
  data: any,
  isOpen: boolean,
  dateOrOther: string,
  untilDateOrCond: any,
}

const Component: React.FC<IProps> = (props) => {
  const [state, setState] = React.useState<IState>(initialState);

  const loadInitialValues = (): void => {
    if (props.initialValues) {
      for (let key in state.data) {
        if (key in props.initialValues) {
          state.data[key] = props.initialValues[key];
        }
      }
    }
  };

  React.useEffect((): void => {
    loadInitialValues();
  }, [loadInitialValues]);

  React.useEffect((): void => {
    if (state.isOpen) {
      loadInitialValues();
      setState(initialState);
    }
  }, [state]);

  const handleOpen = (): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      isOpen: true,
    }));

  const handleClose = (): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      isOpen: false,
    }));

  const onOpen = (): void => props.setReadingId(props.readingId);

  return (
    <Modal
      trigger={
        <Button
          className={classes.button}
          size="large"
          onClick={ handleOpen }
        >
          { props.initialValues ? `Update Assessment` : `Assess` }
        </Button>
      }
      onClose={ handleClose }
      onOpen={ onOpen }
      open={ state.isOpen }
      closeIcon
    >
      <Modal.Header>Referral Follow-Up Information</Modal.Header>
      <Content 
        data={state.data} 
        dateOrOther={state.dateOrOther}
        initialValues={props.initialValues} 
        referralId={props.referralId} 
        untilDateOrCond={state.untilDateOrCond}
        createFollowUp={props.createFollowUp}
        setState={setState} 
        updateFollowUp={props.updateFollowUp}
      />
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  createFollowUp: (data: any) => dispatch(createFollowUp(data)),
  ...bindActionCreators(
    {
      updateFollowUp,
      setReadingId,
    },
    dispatch
  ),
});

export const FollowUpModal = connect(
  ({ }) => ({}),
  mapDispatchToProps
)(Component);
