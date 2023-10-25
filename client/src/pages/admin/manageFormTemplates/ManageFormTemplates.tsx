import {
  FormControlLabel,
  IconButton,
  Switch,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  getFormTemplateAsync,
  getFormTemplateCsvAsync,
  getAllFormTemplatesAsync,
} from 'src/shared/api';
import { useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import { CloudDownloadOutlined, Edit } from '@mui/icons-material';
import UploadTemplate from './UploadTemplate';
import DeleteForever from '@mui/icons-material/DeleteForever';
import {
  FormTemplate,
  FormTemplateWithQuestions,
  TQuestion,
} from 'src/shared/types';
import { TableCell } from '../../../shared/components/apiTable/TableCell';
import { getPrettyDate } from 'src/shared/utils';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useHistory } from 'react-router-dom';
import { Unarchive } from '@mui/icons-material';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';

export const ManageFormTemplates = () => {
  const styles = useAdminStyles();

  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);

  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);

  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);

  const [archivePopupForm, setArchivePopupForm] = useState<FormTemplate>();
  const [unarchivePopupForm, setUnarchivePopupForm] = useState<FormTemplate>();

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

  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'Name',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Version',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Date Created',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Actions',
      options: {
        display: isTransformed ? true : false,
        sort: false,
      },
    },
  ];

  const rowActions = [
    {
      tooltip: 'Edit Form Template',
      Icon: Edit,
      isVisible: (formTemplate: FormTemplate) => !formTemplate.archived,
      onClick: async (formTemplate: FormTemplate) => {
        getFormTemplateWithQuestions(formTemplate);
      },
    },
    {
      tooltip: 'Archive Form Template',
      Icon: DeleteForever,
      isVisible: (formTemplate: FormTemplate) => !formTemplate.archived,
      onClick: (formTemplate: FormTemplate) => {
        setArchivePopupForm(formTemplate);
        setIsArchivePopupOpen(true);
      },
    },
    {
      tooltip: 'Download CSV',
      Icon: CloudDownloadOutlined,
      isVisible: (formTemplate: FormTemplate) => true,
      onClick: async (formTemplate: FormTemplate) => {
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
      isVisible: (formTemplate: FormTemplate) => formTemplate.archived,
      onClick: (formTemplate: FormTemplate) => {
        setUnarchivePopupForm(formTemplate);
        setIsUnarchivePopupOpen(true);
      },
    },
  ];

  const history = useHistory();

  const handleNewPatientClick = () => {
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
    isCreatePopupOpen,
    isArchivePopupOpen,
    isUnarchivePopupOpen,
  ]);

  useEffect(() => {
    const searchLowerCase = search.toLowerCase().trim();

    const formTemplateFilter = (form_template: FormTemplate) => {
      return (
        form_template.classification.name
          .toLowerCase()
          .startsWith(searchLowerCase) ||
        form_template.version.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const rows = formTemplates
      .filter(formTemplateFilter)
      .map((form_template) => [form_template.id]);

    setTableData(rows);
  }, [formTemplates, search]);

  const getFormTemplateWithQuestions = async (formTemplate: FormTemplate) => {
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
          numMin: null,
          numMax: null,
          stringMaxLength: null,
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

  const Row = ({ row }: { row: (string | number)[] }) => {
    const formTemplate = formTemplates.find((form) => form.id === row[0]);

    return formTemplate ? (
      <TableRow
        className={styles.row}
        style={{
          backgroundColor: formTemplate.archived ? 'rgb(251 193 193)' : '#fff',
        }}>
        <TableCell label="Form Template Name" isTransformed={isTransformed}>
          {formTemplate.classification.name}
          {formTemplate.archived ? ' - (Archived)' : ''}
        </TableCell>
        <TableCell label="Version" isTransformed={isTransformed}>
          {formTemplate.version}
        </TableCell>
        <TableCell label="Date Created" isTransformed={isTransformed}>
          {getPrettyDate(formTemplate.dateCreated)}
        </TableCell>
        <TableCell label="Actions" isTransformed={isTransformed}>
          {rowActions.map((action) =>
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
        </TableCell>
      </TableRow>
    ) : (
      <TableRow>
        <TableCell label="" isTransformed={false}>
          Invalid Form
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <UploadTemplate
        open={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
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
        title="Form Templates"
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
        newBtnLabel={'Create Form Template'}
        newBtnOnClick={() => {
          handleNewPatientClick();
        }}
        uploadBtnLabel={'Upload Form Template'}
        uploadBtnLabelOnClick={() => {
          setIsCreatePopupOpen(true);
        }}
        search={search}
        setSearch={setSearch}
      />

      <FormControlLabel
        style={{
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
    </div>
  );
};
