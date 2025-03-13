import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { CloudDownloadOutlined, Edit } from '@mui/icons-material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { Unarchive } from '@mui/icons-material';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';

import { getFormTemplateAsync } from 'src/shared/api/api';
import {
  FormTemplate,
  FormTemplateWithQuestions,
  TQuestion,
} from 'src/shared/types';
import { getPrettyDate } from 'src/shared/utils';
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
import { useFormTemplatesQuery } from './queries';
import { useDownloadTemplateAsCSV } from './mutations';

type FormTemplateWithIndex = FormTemplate & {
  index: number;
};

export const ManageFormTemplates = () => {
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);

  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const [selectedForm, setSelectedForm] = useState<FormTemplate>();

  const [customFormWithQuestions, setCustomFormWithQuestions] =
    useState<FormTemplateWithQuestions | null>(null);

  const navigate = useNavigate();

  const formTemplatesQuery = useFormTemplatesQuery(showArchivedTemplates);

  useEffect(() => {
    if (customFormWithQuestions != null) {
      navigate('/admin/form-templates/new', {
        // search: `id=${customFormWithQuestions.classification.id}`,
        state: {
          ...customFormWithQuestions,
        },
      });
    }
  }, [customFormWithQuestions, navigate]);

  const { mutate: downloadTemplateCSV, isError: downloadTemplateCSVIsError } =
    useDownloadTemplateAsCSV();

  const getFormTemplateWithQuestions = async (
    formTemplate: FormTemplateWithIndex
  ) => {
    const { questions } = await getFormTemplateAsync(formTemplate.id);

    const formTemplateWithQuestions: FormTemplateWithQuestions = {
      classification: formTemplate.classification,
      version: formTemplate.version,
      questions: questions.map((question: TQuestion) => ({
        ...question,
        categoryIndex: question.categoryIndex ?? null,
        numMin: null,
        numMax: null,
        stringMaxLength: null,
        units: null,
      })),
    };

    setCustomFormWithQuestions(formTemplateWithQuestions);
  };

  const handleNewFormClick = () => {
    navigate('/admin/form-templates/new');
  };

  const ActionButtons = useCallback(
    ({ formTemplate }: { formTemplate?: FormTemplateWithIndex }) => {
      if (!formTemplate) return null;

      const actions: TableAction[] = [];

      if (!formTemplate.archived) {
        actions.push({
          tooltip: 'Edit Form Template',
          Icon: Edit,
          onClick: () => {
            getFormTemplateWithQuestions(formTemplate);
          },
        });
        actions.push({
          tooltip: 'Archive Form Template',
          Icon: DeleteForever,
          onClick: () => {
            setSelectedForm(formTemplate);
            setIsArchivePopupOpen(true);
          },
        });
      } else {
        actions.push({
          tooltip: 'Unarchive Form Template',
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
                console.error(file);
                console.error(')))))))))');
                // const link = document.createElement('a');
                // link.href = URL.createObjectURL(file);
                // link.setAttribute(
                //   'download',
                //   `${formTemplate.classification.name}.csv`
                // );
                // link.click();
              },
            }
          );
        },
      });

      return <TableActionButtons actions={actions} />;
    },
    [downloadTemplateCSV]
  );

  const tableColumns: GridColDef[] = [
    { flex: 1, field: 'name', headerName: 'Name' },
    { flex: 1, field: 'version', headerName: 'Version' },
    { flex: 1, field: 'dateCreated', headerName: 'Date Created' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (
        params: GridRenderCellParams<any, FormTemplateWithIndex>
      ) => <ActionButtons formTemplate={params.value} />,
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

      <DataTableHeader title={'Form Templates'}>
        <Stack direction={'row'} gap={'8px'} flexWrap={'wrap'}>
          <Button
            variant={'contained'}
            startIcon={<AddIcon />}
            onClick={() => handleNewFormClick()}>
            {'New Form'}
          </Button>
          <Button
            variant={'contained'}
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadPopupOpen(true)}>
            {'Upload Form'}
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
