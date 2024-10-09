import { FormControlLabel, IconButton, Switch, Tooltip } from '@mui/material';
import {
  getFormTemplateAsync,
  getFormTemplateCsvAsync,
  getAllFormTemplatesAsync,
} from 'src/shared/api';
import { useCallback, useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  AdminTable,
  AdminTableActionButtonsContainer,
  AdminTableToolbar,
  AdminToolBarButton,
} from '../AdminTable';
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
import { useHistory } from 'react-router-dom';
import { Unarchive } from '@mui/icons-material';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';
import AddIcon from '@mui/icons-material/Add';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';

type FormTemplateWithIndex = FormTemplate & {
  index: number;
};

export const ManageFormTemplates = () => {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  const [search, setSearch] = useState('');
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

  useEffect(() => {
    if (customFormWithQuestions != null) {
      history.push({
        pathname: '/admin/form-templates/new',
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

  const actions = [
    {
      tooltip: 'Edit Form Template',
      Icon: Edit,
      isVisible: (formTemplate: FormTemplateWithIndex) =>
        !formTemplate.archived,
      onClick: async (formTemplate: FormTemplateWithIndex) => {
        getFormTemplateWithQuestions(formTemplate);
      },
    },
    {
      tooltip: 'Archive Form Template',
      Icon: DeleteForever,
      isVisible: (formTemplate: FormTemplateWithIndex) =>
        !formTemplate.archived,
      onClick: (formTemplate: FormTemplateWithIndex) => {
        setArchivePopupForm(formTemplate);
        setIsArchivePopupOpen(true);
      },
    },
    {
      tooltip: 'Download CSV',
      Icon: CloudDownloadOutlined,
      isVisible: (formTemplate: FormTemplateWithIndex) => true,
      onClick: async (formTemplate: FormTemplateWithIndex) => {
        try {
          const file = await getFormTemplateCsvAsync(
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
    },
    {
      tooltip: 'Unarchive Form Template',
      Icon: Unarchive,
      isVisible: (formTemplate: FormTemplateWithIndex) => formTemplate.archived,
      onClick: (formTemplate: FormTemplateWithIndex) => {
        setUnarchivePopupForm(formTemplate);
        setIsUnarchivePopupOpen(true);
      },
    },
  ];

  const ActionButtons = useCallback(
    ({ formTemplate }: { formTemplate?: FormTemplateWithIndex }) => {
      return formTemplate ? (
        <AdminTableActionButtonsContainer>
          {actions.map((action) =>
            action.isVisible(formTemplate) ? (
              <Tooltip
                key={action.tooltip}
                placement="top"
                title={action.tooltip}>
                <IconButton
                  onClick={() => {
                    action.onClick(formTemplate);
                  }}
                  size="large">
                  <action.Icon />
                </IconButton>
              </Tooltip>
            ) : null
          )}
        </AdminTableActionButtonsContainer>
      ) : null;
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
      renderCell: (
        params: GridRenderCellParams<any, FormTemplateWithIndex>
      ) => <ActionButtons formTemplate={params.value} />,
    },
  ];

  const history = useHistory();

  const handleNewFormClick = () => {
    history.push('/admin/form-templates/new');
  };

  const getFormTemplates = async (showArchivedTemplates: boolean) => {
    try {
      const resp: FormTemplate[] = await getAllFormTemplatesAsync(
        showArchivedTemplates
      );

      setFormTemplates(
        resp.map((form_template, index) => ({ ...form_template, index }))
      );
      setLoading(false);
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
    const searchLowerCase = search.toLowerCase().trim();

    const formTemplateFilter = (formTemplate: FormTemplate) => {
      if (!showArchivedTemplates && formTemplate.archived) {
        return false;
      }
      return (
        formTemplate.classification.name
          .toLowerCase()
          .startsWith(searchLowerCase) ||
        formTemplate.version.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const filteredTemplates = formTemplates.filter(formTemplateFilter);
    updateRowData(filteredTemplates);
  }, [formTemplates, search]);

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
          questionId: q.questionId,
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

  const toolbar = (
    <AdminTableToolbar title={'Form Templates'} setSearch={setSearch}>
      <AdminToolBarButton
        onClick={() => {
          handleNewFormClick();
        }}>
        <AddIcon /> {'Create Form Template'}
      </AdminToolBarButton>
      <AdminToolBarButton
        onClick={() => {
          setIsUploadPopupOpen(true);
        }}>
        <UploadIcon /> {'Upload Form Template'}
      </AdminToolBarButton>
    </AdminTableToolbar>
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
      <AdminTable
        sx={{
          '& .row-archived': {
            backgroundColor: ARCHIVED_ROW_COLOR,
          },
          '& .row-archived:hover': {
            backgroundColor: ARCHIVED_ROW_HOVERED_COLOR,
          },
          '& .row-archived.Mui-selected': {
            backgroundColor: ARCHIVED_ROW_SELECTED_COLOR,
          },
          '& .row-archived.Mui-selected:hover': {
            backgroundColor: ARCHIVED_ROW_HOVERED_COLOR,
          },
        }}
        columns={columns}
        rows={rows}
        toolbar={toolbar}
        getRowClassName={(params) => {
          const index = params.row.id;
          const formTemplate = formTemplates[index];
          if (!formTemplate) return '';
          return formTemplate.archived ? 'row-archived' : '';
        }}
      />

      <FormControlLabel
        sx={{
          marginTop: '10px',
          marginLeft: 'auto',
          marginRight: '10px',
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
    </>
  );
};

const ARCHIVED_ROW_COLOR = 'rgb(251 193 193)';
const ARCHIVED_ROW_HOVERED_COLOR = '#e57373';
const ARCHIVED_ROW_SELECTED_COLOR = '#ea8f8f';
