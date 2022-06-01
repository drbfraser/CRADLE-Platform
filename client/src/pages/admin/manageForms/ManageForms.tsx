import { API_URL, apiFetch } from 'src/shared/api';
import { IconButton, Tooltip } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import CreateTemplate from './createTemplate';
import DeleteForever from '@material-ui/icons/DeleteForever';
import DeleteTemplateDialog from './DeleteTemplateDialog';
import { EndpointEnum } from 'src/shared/enums';
// import { FormTemplate } from 'src/shared/types';
import { IFormTemplate } from './state';
import { TableCell } from '../../../shared/components/apiTable/TableCell';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export const ManageFormTemplates = () => {
  const styles = useAdminStyles();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formTemplates, setFormTemplates] = useState<IFormTemplate[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupForm, setPopupForm] = useState<IFormTemplate>();
  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'Form Template Name',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Category',
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
      name: 'Last Modified',
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
      tooltip: 'Delete Form Template',
      setOpen: setDeletePopupOpen,
      Icon: DeleteForever,
    },
  ];

  const getFormTemplates = async () => {
    try {
      const resp: IFormTemplate[] = await (
        await apiFetch(API_URL + EndpointEnum.FORM_TEMPLATES)
      ).json();

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

    const formTemplateFilter = (form_template: IFormTemplate) => {
      return (
        form_template.name.toLowerCase().startsWith(searchLowerCase) ||
        form_template.category.toLowerCase().startsWith(searchLowerCase) ||
        form_template.version.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const rows = formTemplates
      .filter(formTemplateFilter)
      .map((ft) => [
        ft.name,
        ft.category,
        ft.version,
        ft.dateCreated,
        ft.lastEdited,
        ft.id,
      ]);

    setTableData(rows);
  }, [formTemplates, search]);

  const Row = ({ row }: { row: (string | number)[] }) => {
    const cells = row.slice(0);

    return (
      <tr className={styles.row}>
        <TableCell label="Form Template Name" isTransformed={isTransformed}>
          {cells[0]}
        </TableCell>
        <TableCell label="Category" isTransformed={isTransformed}>
          {cells[1]}
        </TableCell>
        <TableCell label="Version" isTransformed={isTransformed}>
          {cells[2]}
        </TableCell>
        <TableCell label="Date Created" isTransformed={isTransformed}>
          {cells[3]}
        </TableCell>
        <TableCell label="Date Created" isTransformed={isTransformed}>
          {cells[4]}
        </TableCell>
        <TableCell label="Actions" isTransformed={isTransformed}>
          {rowActions.map((action) => (
            <Tooltip
              key={action.tooltip}
              placement="top"
              title={action.tooltip}>
              <IconButton
                onClick={() => {
                  const form = formTemplates.find((ft) => ft.id === cells[5]);
                  setPopupForm(form);
                  action.setOpen(true);
                }}>
                <action.Icon />
              </IconButton>
            </Tooltip>
          ))}
        </TableCell>
      </tr>
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
      <DeleteTemplateDialog
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          getFormTemplates();
        }}
        deleteForm={popupForm}
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
