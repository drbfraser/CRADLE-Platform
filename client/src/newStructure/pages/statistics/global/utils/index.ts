export const readingsPerMonth = (data: any) => ({
  label: `Total Number of Readings`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(75,192,192,0.4)`,
  borderColor: `rgba(75,192,192,1)`,
  pointRadius: 1,
  data,
});

export const referralsPerMonth = (data: any) => ({
  label: `Total Number of Referrals`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(148,0,211,0.4)`,
  borderColor: `rgba(148,0,211,1)`,
  pointRadius: 1,
  data,
});

export const assessmentsPerMonth = (data: any) => ({
  label: `Total Number of Assesments`,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(255,127,80,0.4)`,
  borderColor: `rgba(255,127,80,1)`,
  pointRadius: 1,
  data,
});
