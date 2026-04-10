import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Visibility } from '@mui/icons-material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { Unarchive } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';

import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { getPrettyDate } from 'src/shared/utils';
import { getAllWorkflowTemplatesAsync } from 'src/shared/api/modules/workflowTemplates';
import { useQuery } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import {
  DataTable,
  DataTableFooter,
} from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';

type WorkflowTemplateWithIndex = WorkflowTemplate & {
  index: number;
};

export const ManageWorkflowTemplates = () => {
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>();

  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const navigate = useNavigate();

  const workflowTemplatesQuery = useQuery({
    queryKey: ['workflowTemplates', showArchivedTemplates],
    queryFn: () => getAllWorkflowTemplatesAsync(showArchivedTemplates),
  });

  const TableRowActions = useCallback(
    ({
      workflowTemplate,
    }: {
      workflowTemplate?: WorkflowTemplateWithIndex;
    }) => {
      if (!workflowTemplate) return null;

      const actions: TableAction[] = [];

      actions.push({
        tooltip: 'View Workflow Template',
        Icon: Visibility,
        onClick: () => {
          navigate('/admin/workflow-templates/view', {
            state: {
              viewWorkflow: workflowTemplate,
            },
          });
        },
      });

      if (!workflowTemplate.archived) {
        actions.push({
          tooltip: 'Archive Workflow ',
          Icon: DeleteForever,
          onClick: () => {
            setSelectedTemplate(workflowTemplate);
            setIsArchivePopupOpen(true);
          },
        });
      } else {
        actions.push({
          tooltip: 'Unarchive Workflow ',
          Icon: Unarchive,
          onClick: () => {
            setSelectedTemplate(workflowTemplate);
            setIsUnarchivePopupOpen(true);
          },
        });
      }
      return <TableActionButtons actions={actions} />;
    },
    [navigate]
  );

  const tableColumns: GridColDef[] = [
    { flex: 1, field: 'name', headerName: 'Workflow Name' },
    { flex: 1, field: 'version', headerName: 'Version' },
    { flex: 1, field: 'dateCreated', headerName: 'Date Created' },
    { flex: 1, field: 'lastEdited', headerName: 'Last edit' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<WorkflowTemplateWithIndex>) => (
        <TableRowActions workflowTemplate={params.value} />
      ),
    },
  ];
  const tableRows = workflowTemplatesQuery.data?.map(
    (template: WorkflowTemplate, index: number) => ({
      id: index,
      name: template.name,
      version: template.version,
      dateCreated: getPrettyDate(template.dateCreated),
      lastEdited: getPrettyDate(template.lastEdited),
      takeAction: template,
    })
  );

  const TableFooter = () => (
    <DataTableFooter>
      <FormControlLabel
        sx={{
          marginLeft: '8px',
          display: 'flex',
        }}
        control={
          <Switch
            onClick={() => setShowArchivedTemplates(!showArchivedTemplates)}
            checked={showArchivedTemplates}
          />
        }
        label="View Archived Workflow"
      />
    </DataTableFooter>
  );

  return (
    <>
      {workflowTemplatesQuery.isError && <APIErrorToast />}

      <ArchiveTemplateDialog
        open={isArchivePopupOpen}
        onClose={() => setIsArchivePopupOpen(false)}
        template={selectedTemplate}
      />
      <UnarchiveTemplateDialog
        open={isUnarchivePopupOpen}
        onClose={() => setIsUnarchivePopupOpen(false)}
        template={selectedTemplate}
      />

      <DataTableHeader title={'Workflow'}>
        <Stack direction={'row'} gap={'8px'} flexWrap={'wrap'}>
          <Button
            variant={'contained'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/workflow-templates/new')}
            sx={{ mr: 2 }}>
            {'New Workflow'}
          </Button>
        </Stack>
      </DataTableHeader>
      <DataTable
        rows={tableRows}
        columns={tableColumns}
        footer={TableFooter}
        loading={workflowTemplatesQuery.isLoading}
        getRowClassName={(params) => {
          const index = params.row.id;
          const workflowTemplate =
            workflowTemplatesQuery.data?.at(index) ?? undefined;
          if (!workflowTemplate) return '';
          return workflowTemplate.archived ? 'row-archived' : '';
        }}
      />
    </>
  );
};
