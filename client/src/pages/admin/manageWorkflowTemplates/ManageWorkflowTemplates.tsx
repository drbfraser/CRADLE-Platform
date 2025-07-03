import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { CloudDownloadOutlined, Edit } from '@mui/icons-material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { Unarchive } from '@mui/icons-material';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';

import { FormTemplate } from 'src/shared/types/form/formTemplateTypes';
import { getPrettyDate } from 'src/shared/utils';
import { useFormTemplatesQuery } from 'src/shared/queries';
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
import UploadTemplate from './UploadTemplate';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';
import { useDownloadTemplateAsCSV } from './mutations';

type FormTemplateWithIndex = FormTemplate & {
  index: number;
};

export const ManageWorkflowTemplates = () => {
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);

  const [selectedForm, setSelectedForm] = useState<FormTemplate>();

  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const navigate = useNavigate();

  const formTemplatesQuery = useFormTemplatesQuery(showArchivedTemplates);
  const { mutate: downloadTemplateCSV, isError: downloadTemplateCSVIsError } =
    useDownloadTemplateAsCSV();

  const TableRowActions = useCallback(
    ({ formTemplate }: { formTemplate?: FormTemplateWithIndex }) => {
      if (!formTemplate) return null;

      const actions: TableAction[] = [];

      if (!formTemplate.archived) {
        actions.push({
          tooltip: 'Edit Workflow Template',
          Icon: Edit,
          onClick: () => {
            navigate('/admin/workflow-templates/new', {
              state: {
                editFormId: formTemplate.id,
              },
            });
          },
        });
        actions.push({
          tooltip: 'Archive Workflow Template',
          Icon: DeleteForever,
          onClick: () => {
            setSelectedForm(formTemplate);
            setIsArchivePopupOpen(true);
          },
        });
      } else {
        actions.push({
          tooltip: 'Unarchive Workflow Template',
          Icon: Unarchive,
          onClick: () => {
            setSelectedForm(formTemplate);
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
              id: formTemplate.id,
              version: formTemplate.version,
            },
            {
              onSuccess: (file: Blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.setAttribute(
                  'download',
                  `${formTemplate.classification.name}.csv`
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
      renderCell: (
        params: GridRenderCellParams<any, FormTemplateWithIndex>
      ) => <TableRowActions formTemplate={params.value} />,
    },
  ];
  const tableRows = formTemplatesQuery.data?.map((template, index) => ({
    id: index,
    name: template.classification.name,
    version: template.version,
    dateCreated: getPrettyDate(template.dateCreated),
    takeAction: template,
  }));

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
        label="View Archived Templates"
      />
    </DataTableFooter>
  );

  return (
    <>
      {(formTemplatesQuery.isError || downloadTemplateCSVIsError) && (
        <APIErrorToast />
      )}

      <UploadTemplate
        open={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
      />
      <ArchiveTemplateDialog
        open={isArchivePopupOpen}
        onClose={() => setIsArchivePopupOpen(false)}
        template={selectedForm}
      />
      <UnarchiveTemplateDialog
        open={isUnarchivePopupOpen}
        onClose={() => setIsUnarchivePopupOpen(false)}
        template={selectedForm}
      />

      <DataTableHeader title={'Workflow Templates'}>
        <Stack direction={'row'} gap={'8px'} flexWrap={'wrap'}>
          <Button
            variant={'contained'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/workflow-templates/new')}>
            {'New Template'}
          </Button>
          <Button
            variant={'contained'}
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadPopupOpen(true)}>
            {'Upload Template'}
          </Button>
        </Stack>
      </DataTableHeader>
      <DataTable
        rows={tableRows}
        columns={tableColumns}
        footer={TableFooter}
        getRowClassName={(params) => {
          const index = params.row.id;
          const formTemplate = formTemplatesQuery.data?.at(index) ?? undefined;
          if (!formTemplate) return '';
          return formTemplate.archived ? 'row-archived' : '';
        }}
      />
    </>
  );
};
