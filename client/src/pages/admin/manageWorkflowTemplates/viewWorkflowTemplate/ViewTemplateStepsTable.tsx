import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DataTableToolbar } from 'src/shared/components/DataTable/DataTable';
import {
  TemplateStep,
  TemplateStepBranch,
} from 'src/shared/types/workflow/workflowTypes';

interface IProps {
  steps: TemplateStep[] | undefined;
}

export const ViewTemplateStepsTable = ({ steps }: IProps) => {
  if (!steps) {
    return;
  }

  function getNextIds(branches?: TemplateStepBranch[]): string {
    if (branches) {
      let ret = '';
      for (const branch of branches) {
        ret += branch.targetStepId + ' ';
      }
      return ret;
    } else {
      return '';
    }
  }

  const tableRows = steps.map((step) => ({
    id: step.id,
    name: step.name,
    title: step.title,
    formId: step.formId,
    expectedCompletion: step.expectedCompletion,
    conditions: step.conditions,
    nextIds: getNextIds(step.branches),
    archived: step.archived,
    lastEdited: step.lastEdited,
    lastEditedBy: step.lastEditedBy,
  }));

  const tableColumns: GridColDef[] = [
    { flex: 1, field: 'id', headerName: 'ID' },
    { flex: 1, field: 'name', headerName: 'Name' },
    { flex: 1, field: 'title', headerName: 'Title' },
    { flex: 1, field: 'formId', headerName: 'Form ID' },
    { flex: 1, field: 'expectedCompletion', headerName: 'Expected Completion' },
    { flex: 1, field: 'conditions', headerName: 'Conditions' },
    { flex: 1, field: 'nextIds', headerName: 'Next Step IDs' },
    { flex: 1, field: 'archived', headerName: 'Archived' },
    { flex: 1, field: 'lastEdited', headerName: 'Last Edited' },
    { flex: 1, field: 'lastEditedBy', headerName: 'Last Edited By' },
  ];

  return (
    <>
      <Box>
        <h2>Steps</h2>
      </Box>
      <DataGrid
        rows={tableRows}
        columns={tableColumns}
        slots={{ toolbar: () => <DataTableToolbar /> }}
      />
    </>
  );
};
