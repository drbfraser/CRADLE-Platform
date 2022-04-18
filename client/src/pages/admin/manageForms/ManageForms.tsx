import React, { useEffect, useState } from 'react';
import { apiFetch, API_URL } from 'src/shared/api';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { TableCell } from '../../../shared/components/apiTable/TableCell';
import AdminTable from '../AdminTable';
import { IFormTemplate } from './state';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { EndpointEnum } from 'src/shared/enums';
import CreateTemplate from './createTemplate';

export const ManageFormTemplates = () => {
  const styles = useAdminStyles();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formTemplates, setFormTemplates] = useState<IFormTemplate[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
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
  ];

  const getFormTemplates = async () => {
    try {
      const resp: IFormTemplate[] = await (
        await apiFetch(API_URL + EndpointEnum.FORM_TEMPLATES)
      ).json();

      setFormTemplates(resp.map((form_template, index) => ({...form_template, index})));
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
      .map((form_template) => [
        form_template.name,
        form_template.category,
        form_template.version,
        form_template.dateCreated,
        form_template.lastEdited,
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
