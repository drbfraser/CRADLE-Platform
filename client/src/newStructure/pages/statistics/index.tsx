import { Bar, Line } from 'react-chartjs-2';
import { Card, Statistic } from 'semantic-ui-react';

import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { getStatistics } from '../../shared/reducers/allPatientsStatistics';

interface IProps {
  getCurrentUser: any;
  getStatistics: any;
  user: any;
  statisticsList: any;
}

class StatisticsPageComponent extends React.Component<IProps> {
  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
    this.props.getStatistics();
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    const xLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const trafficLightLabels = [
      'GREEN',
      'YELLOW UP',
      'YELLOW DOWN',
      'RED UP',
      'RED DOWN',
    ];

    var getDate = new Date();
    var getMonth = getDate.getMonth();

    const readingsPerMonth = {
      label: 'Total Number of Readings',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: this.props.statisticsList.readingsPerMonth,
    };

    const referralsPerMonth = {
      label: 'Total Number of Referrals',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: this.props.statisticsList.referralsPerMonth,
    };

    const center = {
      display: `flex`,
      flexDirection: `column` as `column`,
      alignItems: `center`
    };

    const headerSize = { fontSize: 40 };

    const statSubBox = {
      width: 200,
      padding: `5px 0 5px 10px`,
      border: `1px solid rgb(211, 205, 205)`,
      borderRadius: 7,
      boxShadow: `3px 1px rgb(211, 205, 205)`, 
    };

    const underlineBlue = { borderBottom: `2px solid #4bc0c0` };

    const underlinePurple = { borderBottom: `2px solid #9400D3` };

    const underlineOrange = { borderBottom: `2px solid #FF7F50` };

    const underlineBlack = { borderBottom: `2px solid #15152B` };

    const verticalWriting = {
      width: 100,
      margin: `0 auto`,
      lineHeight: 16,
    };

    const chartBox = {
      width: `75%`,
    };

    const assessmentsPerMonth = {
      label: 'Total Number of Assesments',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.assessmentsPerMonth,
    };

    const womenReferredPerMonth = {
      label: 'Total Number of Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(21,21,43,0.4)',
      borderColor: 'rgba(21,21,43,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenReferredPerMonth,
    };

    const pregnantWomenReferredPerMonth = {
      label: 'Total Number of Pregnant Women Referred',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      pointRadius: 1,
      data: this.props.statisticsList.pregnantWomenReferredPerMonth,
    };

    const womenAssessedPerMonth = {
      label: 'Total Number of Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(148,0,211,0.4)',
      borderColor: 'rgba(148,0,211,1)',
      pointRadius: 1,
      data: this.props.statisticsList.womenAssessedPerMonth,
    };

    const pregnantWomenAssessedPerMonth = {
      label: 'Total Number of Pregnant Women Assessed',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255,127,80,0.4)',
      borderColor: 'rgba(255,127,80,1)',
      pointRadius: 1,
      data: this.props.statisticsList.pregnantWomenAssessedPerMonth,
    };

    const readingsVsReferralsVsAssessment = {
      labels: xLabels,
      datasets: [readingsPerMonth, referralsPerMonth, assessmentsPerMonth],
    };

    const womenReferralsVsAssessed = {
      labels: xLabels,
      datasets: [
        womenReferredPerMonth,
        pregnantWomenReferredPerMonth,
        womenAssessedPerMonth,
        pregnantWomenAssessedPerMonth,
      ],
    };

    var trafficLight = {};
    if (this.props.statisticsList.trafficLightStatusLastMonth) {
      trafficLight = {
        labels: trafficLightLabels,
        datasets: [
          {
            backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'],
            data: Object.values(
              this.props.statisticsList.trafficLightStatusLastMonth
            ),
          },
        ],
      };
    }

    return (
      <div>
        <div style={{ padding: `0 5%` }}>
          <h1 style={headerSize}>Our Health Facility’s Statistics</h1>
          <div>
            <h2>In the last month, our health facility assessed:</h2>
            <div
              style={center}>
              {this.props.statisticsList.uniquePeopleAssesedPerMonth ||
              this.props.statisticsList.womenAssessedPerMonth ||
              this.props.statisticsList.pregnantWomenAssessedPerMonth ? (
                <Statistic.Group
                  style={{ margin: `0 auto` }}>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlue}>
                      {
                        this.props.statisticsList.uniquePeopleAssesedPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label>PEOPLE</Statistic.Label>
                  </Statistic>

                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlue}>
                      {
                        this.props.statisticsList.womenAssessedPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label>WOMEN</Statistic.Label>
                  </Statistic>

                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlue}>
                      {
                        this.props.statisticsList.pregnantWomenAssessedPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      PREGNANT WOMEN
                    </Statistic.Label>
                  </Statistic>
                </Statistic.Group>
              ) : (
                <div></div>
              )}
            </div>
          </div>
          <br />
          <br />
          <h1 style={headerSize}>Global Statistics</h1>
          <div>
            <h2>In the last month, there were:</h2>
            <div style={center}>
              {this.props.statisticsList.readingsPerMonth &&
              this.props.statisticsList.referralsPerMonth &&
              this.props.statisticsList.assessmentsPerMonth ? (
                <Statistic.Group
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingBottom: 20,
                  }}>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlue}>
                      {this.props.statisticsList.readingsPerMonth[getMonth - 1]}
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      READINGS TAKEN
                    </Statistic.Label>
                  </Statistic>

                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlinePurple}>
                      {
                        this.props.statisticsList.referralsPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      REFERRALS SENT
                    </Statistic.Label>
                  </Statistic>

                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineOrange}>
                      {
                        this.props.statisticsList.assessmentsPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      ASSESSMENTS MADE
                    </Statistic.Label>
                  </Statistic>
                </Statistic.Group>
              ) : (
                <div></div>
              )}
              <div style={chartBox}>
                <Card fluid>
                  <Card.Content>
                    <Line ref="chart" data={readingsVsReferralsVsAssessment} />
                  </Card.Content>
                </Card>
              </div>
            </div>
            <br />
          </div>
          <br />
          <br />
          <div>
            <h2>A snapshot of all women assessed:</h2>
            <div style={center}>
              {this.props.statisticsList.womenReferredPerMonth &&
              this.props.statisticsList.pregnantWomenReferredPerMonth &&
              this.props.statisticsList.womenAssessedPerMonth &&
              this.props.statisticsList.pregnantWomenAssessedPerMonth ? (
                <Statistic.Group
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingBottom: 20,
                  }}>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlack}>
                      {
                        this.props.statisticsList.womenReferredPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      WOMEN REFERRED
                    </Statistic.Label>
                  </Statistic>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineBlue}>
                      {
                        this.props.statisticsList.pregnantWomenReferredPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      PREGNANT WOMEN REFERRED
                    </Statistic.Label>
                  </Statistic>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlinePurple}>
                      {
                        this.props.statisticsList.womenAssessedPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      WOMEN ASSESSED
                    </Statistic.Label>
                  </Statistic>
                  <Statistic horizontal style={statSubBox}>
                    <Statistic.Value style={underlineOrange}>
                      {
                        this.props.statisticsList.pregnantWomenAssessedPerMonth[
                          getMonth - 1
                        ]
                      }
                    </Statistic.Value>
                    <Statistic.Label style={verticalWriting}>
                      PREGNANT WOMEN ASSESSED
                    </Statistic.Label>
                  </Statistic>
                </Statistic.Group>
              ) : (
                <div></div>
              )}
              <br />
              <div style={chartBox}>
                <Card fluid>
                  <Card.Content>
                    <Line ref="chart" data={womenReferralsVsAssessed} />
                  </Card.Content>
                </Card>
              </div>
            </div>
          </div>
          <br />
          <br />
          <div>
            <h2 style={{ marginBottom: -10 }}>Traffic lights from last month:</h2>
            <br />
            <div style={center}>
              <div style={chartBox}>
                <Card fluid>
                  <Card.Content>
                    <Bar
                      ref="chart"
                      data={trafficLight}
                      options={{
                        legend: { display: false },
                        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
                      }}
                    />
                  </Card.Content>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user, statistics }: any) => ({
  user: user.currentUser,
  statisticsList: statistics.statisticsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  getStatistics: () => {
    dispatch(getStatistics());
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser());
  },
});

export const StatisticsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatisticsPageComponent);
