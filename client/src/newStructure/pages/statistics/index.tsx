import React from 'react';
import { connect } from 'react-redux';
import { getStatistics } from '../../shared/reducers/statistics';
import { HealthFacilityStatistics } from './healthFacility';
import { GlobalStatistics } from './global';
import { AllAssessedWomenStatsitics } from './allAssessedWomen';
import { LastMonthTrafficLightsStatistics } from './lastMonthTrafficLights';
import classes from './styles.module.css';

interface IProps {
  getStatistics: any;
  statisticsList: any;
}

const Page: React.FC<IProps> = ({ getStatistics, statisticsList }) => {
  const currentMonth = React.useRef<number>(new Date().getMonth());

  React.useEffect((): void => {
    getStatistics();
  }, [getStatistics]);

  return (
    <div>
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
        <br />
        <AllAssessedWomenStatsitics 
          currentMonth={currentMonth.current} 
          statisticsList={statisticsList} 
        />
        <br />
        <br />
        <LastMonthTrafficLightsStatistics statisticsList={statisticsList} />
      </div>
    </div>
  );
}

const mapStateToProps = ({ statistics }: any) => ({
  statisticsList: statistics.statisticsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  getStatistics: () => {
    dispatch(getStatistics());
  },
});

export const StatisticsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
