import React from 'react';
import { Tab } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { MedicalHistoryTable } from './MedicalHistory';
import { DrugHistoryTable } from './DrugHistory';
import { PregnancyHistoryTable } from './PregnancyHistory2';

const allPanes = [
  {
    name: 'Pregnancy History',
    Component: PregnancyHistoryTable,
  },
  {
    name: 'Medical History',
    Component: MedicalHistoryTable,
  },
  {
    name: 'Drug History',
    Component: DrugHistoryTable,
  },
];

type RouteParams = {
  patientId: string;
};

export function HistoryTablesPage() {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const classes = useStyles();

  const panes = allPanes.map((p) => ({
    menuItem: p.name,
    render: () => (
      <Tab.Pane>
        <p.Component patientId={patientId} />
      </Tab.Pane>
    ),
  }));

  return (
    <div>
      <Tab
        menu={{
          secondary: true,
          pointing: true,
        }}
        panes={panes}
        className={classes.tabs}
      />
    </div>
  );
}

const useStyles = makeStyles({
  tabs: {
    display: 'fluid',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
