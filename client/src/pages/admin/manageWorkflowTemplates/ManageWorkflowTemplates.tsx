import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { CloudDownloadOutlined, Edit } from '@mui/icons-material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { Unarchive } from '@mui/icons-material';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';

import { WorkflowTemplate } from 'src/shared/types/workflow/workflowTypes';
import { getPrettyDate } from 'src/shared/utils';
import { getAllWorkflowTemplatesAsync } from 'src/shared/api/modules/workflowTemplates';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import UploadTemplate from '../sharedComponent/UploadTemplate';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';
import { useDownloadTemplateAsCSV } from './mutations';

type WorkflowTemplateWithIndex = WorkflowTemplate & {
  index: number;
};

export const ManageWorkflowTemplates = () => {
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>();

  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workflowTemplatesQuery = useQuery({
    queryKey: ['workflowTemplates', showArchivedTemplates],
    queryFn: () => getAllWorkflowTemplatesAsync(showArchivedTemplates),
  });
  const { mutate: downloadTemplateCSV, isError: downloadTemplateCSVIsError } =
    useDownloadTemplateAsCSV();

  const TableRowActions = useCallback(
    ({
      workflowTemplate,
    }: {
      workflowTemplate?: WorkflowTemplateWithIndex;
    }) => {
      if (!workflowTemplate) return null;

      const actions: TableAction[] = [];

      if (!workflowTemplate.archived) {
        actions.push({
          tooltip: 'Edit Workflow ',
          Icon: Edit,
          onClick: () => {
            navigate('/admin/workflow-templates/new', {
              state: {
                editTemplateId: workflowTemplate.id,
              },
            });
          },
        });
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

      actions.push({
        tooltip: 'Download CSV',
        Icon: CloudDownloadOutlined,
        onClick: () => {
          downloadTemplateCSV(
            {
              id: workflowTemplate.id,
              version: `${workflowTemplate.version}`,
            },
            {
              onSuccess: (file: Blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.setAttribute(
                  'download',
                  `${
                    workflowTemplate.classification?.name ||
                    workflowTemplate.name
                  }.csv`
                );
                link.click();
              },
            }
          );
        },
      });

      return <TableActionButtons actions={actions} />;
    },
    [downloadTemplateCSV, navigate]
  );

  const tableColumns: GridColDef[] = [
    { flex: 1, field: 'name', headerName: 'Name' },
    { flex: 1, field: 'classification', headerName: 'classification' },
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
      classification: template.classification?.name || 'N/A',
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
      {(workflowTemplatesQuery.isError || downloadTemplateCSVIsError) && (
        <APIErrorToast />
      )}

      <UploadTemplate
        open={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
        type="workflow"
        onUploadSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
        }}
      />
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
            // onClick={() => navigate('/admin/workflow-templates/new')}
          >
            {'New Workflow'}
          </Button>
          <Button
            variant={'contained'}
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadPopupOpen(true)}>
            {'Upload Workflow'}
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
