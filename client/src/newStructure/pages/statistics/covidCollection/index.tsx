import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../../redux/rootReducer';


const Page: React.FC<any> = (props) => {

  return (
    <div>Covid 19 Data Collection</div>
  );
}





const mapStateToProps = ({ patients }: ReduxState) => ({

});

const mapDispatchToProps = (dispatch: any) => ({
  
});
export const CovidCollection = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);