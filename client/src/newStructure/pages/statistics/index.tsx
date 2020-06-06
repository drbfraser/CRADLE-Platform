import './index.css';

import { AllAssessedWomenStatsitics } from './allAssessedWomen';
import { GlobalStatistics } from './global';
import { HealthFacilityStatistics } from './healthFacility';
import { LastMonthTrafficLightsStatistics } from './lastMonthTrafficLights';
import React from 'react';
import { ReduxState } from '../../../newStructure/redux/rootReducer';
import { bindActionCreators } from 'redux';
import classes from './styles.module.css';
import { connect } from 'react-redux';
import { getStatistics } from '../../shared/reducers/statistics';
interface IProps {
  getStatistics: any;
  statisticsList: any;
}

const Page: React.FC<IProps> = ({ getStatistics, statisticsList }) => {
  const currentMonth = React.useRef<number>(new Date().getMonth());

  React.useEffect((): void => {
    getStatistics();
  }, [getStatistics]);

  return statisticsList ? (
    <div className={classes.container}>
      <HealthFacilityStatistics
        currentMonth={currentMonth.current}
        statisticsList={statisticsList}
      />
      <br />
      <br />
      <GlobalStatistics
        currentMonth={currentMonth.current}
        statisticsList={statisticsList}
      />
      <br />
      <br />
      <AllAssessedWomenStatsitics
        currentMonth={currentMonth.current}
        statisticsList={statisticsList}
      />
      <br />
      <br />
      <LastMonthTrafficLightsStatistics statisticsList={statisticsList} />
    </div>
  ) : (
    <>Loading ...</>
  );
};

const mapStateToProps = ({ statistics }: ReduxState) => ({
  statisticsList: statistics.data,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getStatistics,
    },
    dispatch
  ),
});

export const StatisticsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
