import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../../redux/rootReducer';
import {Divider, Paper} from '@material-ui/core';

const Page: React.FC<any> = (props) => {
  return (
    <div
      style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <h1>
        <b>Covid 19 Data Collection</b>
      </h1>
      <Divider></Divider>
      <Paper style={{ padding: '35px 25px', borderRadius: '15px' }}></Paper>

      
    </div>
  );
};

const mapStateToProps = ({ patients }: ReduxState) => ({});

const mapDispatchToProps = (dispatch: any) => ({});
export const CovidCollection = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
