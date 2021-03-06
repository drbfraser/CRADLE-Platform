import { IconButton, TableRow, Tooltip } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import CreateTemplate from './CreateTemplate';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { FormTemplate } from 'src/shared/types';
import { TableCell } from '../../../shared/components/apiTable/TableCell';
import { getFormTemplatesAsync } from 'src/shared/api';
import { getPrettyDateTime } from 'src/shared/utils';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export const ManageFormTemplates = () => {
  const styles = useAdminStyles();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [archievePopupOpen, setArchievePopupOpen] = useState(false);
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
      setOpen: setArchievePopupOpen,
      Icon: DeleteForever,
      isVisible: (form: FormTemplate) => {
        return form.archived === false;
      },
    },
  ];

  const getFormTemplates = async () => {
    try {
      const resp: FormTemplate[] = await getFormTemplatesAsync();

      setFormTemplates(
        resp.map((form_template, index) => ({ ...form_template, index }))
      );
      setLoading(false);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getFormTemplates();
  }, []);

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
          {getPrettyDateTime(formTemplate.dateCreated)}
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
                    setPopupForm(formTemplate);
                    action.setOpen(true);
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
        open={createPopupOpen}
        onClose={() => {
          setCreatePopupOpen(false);
          getFormTemplates();
        }}
      />
      <ArchiveTemplateDialog
        open={archievePopupOpen}
        onClose={() => {
          setArchievePopupOpen(false);
          getFormTemplates();
        }}
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
          setCreatePopupOpen(true);
        }}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};
