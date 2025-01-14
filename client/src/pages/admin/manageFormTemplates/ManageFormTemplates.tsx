import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import {
  getFormTemplateAsync,
  getFormTemplateCsvAsync,
  getAllFormTemplatesAsync,
} from 'src/shared/api/api';
import { useCallback, useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import { CloudDownloadOutlined, Edit } from '@mui/icons-material';
import UploadTemplate from './UploadTemplate';
import DeleteForever from '@mui/icons-material/DeleteForever';
import {
  FormTemplate,
  FormTemplateWithQuestions,
  TQuestion,
} from 'src/shared/types';
import { getPrettyDate } from 'src/shared/utils';
import { useNavigate } from 'react-router-dom';
import { Unarchive } from '@mui/icons-material';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';
import AddIcon from '@mui/icons-material/Add';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import {
  DataTable,
  DataTableFooter,
} from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from '../../../shared/components/DataTable/DataTableHeader';

type FormTemplateWithIndex = FormTemplate & {
  index: number;
};

export const ManageFormTemplates = () => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);
  const [formTemplates, setFormTemplates] = useState<FormTemplateWithIndex[]>(
    []
  );

  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const [archivePopupForm, setArchivePopupForm] =
    useState<FormTemplateWithIndex>();
  const [unarchivePopupForm, setUnarchivePopupForm] =
    useState<FormTemplateWithIndex>();

  const [customFormWithQuestions, setCustomFormWithQuestions] =
    useState<FormTemplateWithQuestions | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (customFormWithQuestions != null) {
      navigate('/admin/form-templates/new', {
        // search: `id=${customFormWithQuestions.classification.id}`,
        state: {
          ...customFormWithQuestions,
        },
      });
    }
  }, [customFormWithQuestions]);

  const [rows, setRows] = useState<GridRowsProp>([]);
  const updateRowData = (formTemplates: FormTemplateWithIndex[]) => {
    setRows(
      formTemplates.map((formTemplate) => ({
        id: formTemplate.index,
        name: formTemplate.classification.name,
        version: formTemplate.version,
        dateCreated: getPrettyDate(formTemplate.dateCreated),
        takeAction: formTemplate,
      }))
    );
  };

  const ActionButtons = useCallback(
    ({ formTemplate }: { formTemplate?: FormTemplateWithIndex }) => {
      if (!formTemplate) return null;
      const actions: TableAction[] = [];
      if (!formTemplate.archived) {
        actions.push({
          tooltip: 'Edit Form Template',
          Icon: Edit,
          onClick: async () => {
            getFormTemplateWithQuestions(formTemplate);
          },
        });
        actions.push({
          tooltip: 'Archive Form Template',
          Icon: DeleteForever,
          onClick: () => {
            setArchivePopupForm(formTemplate);
            setIsArchivePopupOpen(true);
          },
        });
      } else {
        actions.push({
          tooltip: 'Unarchive Form Template',
          Icon: Unarchive,
          onClick: () => {
            setUnarchivePopupForm(formTemplate);
            setIsUnarchivePopupOpen(true);
          },
        });
      }

      actions.push({
        tooltip: 'Download CSV',
        Icon: CloudDownloadOutlined,
        onClick: async () => {
          try {
            const file: Blob = await getFormTemplateCsvAsync(
              formTemplate.id,
              formTemplate.version
            );

            const objectURL = URL.createObjectURL(file);

            const link = document.createElement('a');
            link.href = objectURL;
            link.setAttribute(
              'download',
              `${formTemplate.classification.name}.csv`
            );
            link.click();
          } catch (e) {
            setErrorLoading(true);
          }
        },
      });

      return <TableActionButtons actions={actions} />;
    },
    []
  );

  const columns: GridColDef[] = [
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

  const handleNewFormClick = () => {
    navigate('/admin/form-templates/new');
  };

  const getFormTemplates = async (showArchivedTemplates: boolean) => {
    try {
      const resp: FormTemplate[] = await getAllFormTemplatesAsync(
        showArchivedTemplates
      );

      setFormTemplates(
        resp.map((form_template, index) => ({ ...form_template, index }))
      );
    } catch (e) {
      setErrorLoading(true);
    }
  };
  useEffect(() => {
    getFormTemplates(showArchivedTemplates);
  }, [
    showArchivedTemplates,
    isUploadPopupOpen,
    isArchivePopupOpen,
    isUnarchivePopupOpen,
  ]);

  useEffect(() => {
    const formTemplateFilter = (formTemplate: FormTemplate) => {
      if (!showArchivedTemplates && formTemplate.archived) {
        return false;
      }
      return true;
    };

    const filteredTemplates = formTemplates.filter(formTemplateFilter);
    updateRowData(filteredTemplates);
  }, [formTemplates, showArchivedTemplates]);

  const getFormTemplateWithQuestions = async (
    formTemplate: FormTemplateWithIndex
  ) => {
    const questions = await getFormTemplateAsync(formTemplate.id);
    const formTemplateWithQuestions: FormTemplateWithQuestions = {
      classification: {
        name: formTemplate.classification.name,
        id: formTemplate.classification.id,
      },
      version: formTemplate.version,
      questions: questions.questions.map((q: TQuestion) => {
        return {
          categoryIndex: q.categoryIndex ?? null,
          questionId: q.id,
          questionLangVersions: q.questionLangVersions.map((qlv) => {
            return {
              lang: qlv.lang,
              mcOptions: qlv.mcOptions,
              questionText: qlv.questionText,
            };
          }),
          questionIndex: q.questionIndex,
          questionType: q.questionType,
          required: q.required,
          allowFutureDates: q.allowFutureDates,
          allowPastDates: q.allowPastDates,
          numMin: null,
          numMax: null,
          stringMaxLength: null,
          stringMaxLines: q.stringMaxLines,
          units: null,
          visibleCondition: q.visibleCondition,
        };
      }),
    };

    try {
      setCustomFormWithQuestions(formTemplateWithQuestions);
    } catch (e) {
      console.error(e);
    }
  };

  const HeaderButtons = () => {
    return (
      <Stack direction={'row'} gap={'8px'} flexWrap={'wrap'}>
        <Button
          variant={'contained'}
          startIcon={<AddIcon />}
          onClick={() => {
            handleNewFormClick();
          }}>
          {'New Form'}
        </Button>
        <Button
          variant={'contained'}
          startIcon={<UploadIcon />}
          onClick={() => {
            setIsUploadPopupOpen(true);
          }}>
          {'Upload Form'}
        </Button>
      </Stack>
    );
  };

  const Footer = () => (
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
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <UploadTemplate
        open={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
      />
      <ArchiveTemplateDialog
        open={isArchivePopupOpen}
        onClose={() => setIsArchivePopupOpen(false)}
        template={archivePopupForm}
      />
      <UnarchiveTemplateDialog
        open={isUnarchivePopupOpen}
        onClose={() => setIsUnarchivePopupOpen(false)}
        template={unarchivePopupForm}
      />
      <DataTableHeader title={'Form Templates'}>
        <HeaderButtons />
      </DataTableHeader>
      <DataTable
        rows={rows}
        columns={columns}
        footer={Footer}
        getRowClassName={(params) => {
          const index = params.row.id;
          const formTemplate = formTemplates[index];
          if (!formTemplate) return '';
          return formTemplate.archived ? 'row-archived' : '';
        }}
      />
    </>
  );
};
