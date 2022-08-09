import {
  FormControlLabel,
  IconButton,
  Switch,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getFormTemplateCsvAsync, getFormTemplatesAsync } from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import { CloudDownloadOutlined } from '@material-ui/icons';
import CreateTemplate from './CreateTemplate';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { FormTemplate } from 'src/shared/types';
import { TableCell } from '../../../shared/components/apiTable/TableCell';
import { getPrettyDate } from 'src/shared/utils';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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

  const [popupForm, setPopupForm] = useState<FormTemplate>();

  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'Form Classification',
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
      tooltip: 'Archive Form Template',
      Icon: DeleteForever,
      isVisible: async (formTemplate: FormTemplate) => !formTemplate.archived,
      onClick: (formTemplate: FormTemplate) => {
        setPopupForm(formTemplate);
        setIsArchivePopupOpen(true);
      },
    },
    {
      tooltip: 'Download CSV',
      Icon: CloudDownloadOutlined,
      isVisible: (formTemplate: FormTemplate) => !formTemplate.archived,
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
  ];

  const getFormTemplates = async (showArchivedTemplates: boolean) => {
    try {
      const resp: FormTemplate[] = await getFormTemplatesAsync(
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
  }, [showArchivedTemplates, isCreatePopupOpen, isArchivePopupOpen]);

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
                  }}>
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
      <CreateTemplate
        open={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
      />
      <ArchiveTemplateDialog
        open={isArchivePopupOpen}
        onClose={() => setIsArchivePopupOpen(false)}
        template={popupForm}
      />
      <AdminTable
        title="Form Templates"
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
        newBtnLabel={'New Form Template'}
        newBtnOnClick={() => {
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
        label="Show Archived Templates"
      />
    </div>
  );
};
