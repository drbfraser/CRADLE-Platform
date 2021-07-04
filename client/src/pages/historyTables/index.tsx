import React from 'react';
import { Tab } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { DrugOrMedHistoryTable } from './DrugOrMedHistory';
import { PregnancyHistoryTable } from './PregnancyHistory';
import { SexEnum } from 'src/shared/enums';

const allPanes = [
  {
    name: 'Pregnancy History',
    Component: PregnancyHistoryTable,
  },
  {
    name: 'Medical History',
    Component: DrugOrMedHistoryTable,
  },
  {
    name: 'Drug History',
    Component: DrugOrMedHistoryTable,
  },
];

type RouteParams = {
  patientId: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const { patientId, patientSex } = useRouteMatch<RouteParams>().params;
  const classes = useStyles();
  const panes = allPanes.map((p) =>
    p.name === 'Pregnancy History' && patientSex === SexEnum.MALE
      ? {}
      : {
          menuItem: p.name,
          render: () => (
            <Tab.Pane>
              <p.Component
                patientId={patientId}
                isDrugRecord={p.name === 'Drug History' ? true : false}
              />
            </Tab.Pane>
          ),
        }
  );

  return (
    <div>
      <Tab
        menu={{
          secondary: true,
          pointing: true,
          className: classes.tabs,
        }}
        panes={panes}
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
