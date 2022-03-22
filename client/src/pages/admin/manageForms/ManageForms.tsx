import React, { useEffect, useState } from "react";
import { useAdminStyles } from "../adminStyles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { IForm } from "../../../shared/types";
import CreateIcon from "@material-ui/icons/Create";
import DeleteForever from "@material-ui/icons/DeleteForever";
import { TableCell } from "../../../shared/components/apiTable/TableCell";
import { IconButton, Tooltip } from "@material-ui/core";
import AdminTable from "../AdminTable";


export const ManageForms = () => {
  const styles = useAdminStyles();
  const [loading] = useState(true);
  const [search, setSearch] = useState('')
  const [forms, setForms] = useState<IForm[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'Form Name',
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
      name: 'Last Edited',
      options: {
        display: isTransformed ? true : false,
      },
    },
  ];

  const getForms = async () => {
    // FAKE DATA FOR NOW
    let fakeForm:IForm = {
      formTemplateId: 10,
      name: "A form",
      category: "A category",
      version: "A version",
      dateCreated: "Some kind of date",
      lastEdited: "Last edited"
    }
    let respForms:IForm[] = [fakeForm]
    setForms(respForms)
  }

  useEffect(() => {
    getForms();
  }, []);

  useEffect(() => {

    const rows = forms
      .map((form) => [
        form.name,
        form.category,
        form.version,
        form.dateCreated,
        form.lastEdited
      ]);

    setTableData(rows);
  }, [forms])

  const rowActions = [
    {
      tooltip: 'Edit Form',
      Icon: CreateIcon,
    },
    {
      tooltip: 'Delete Form',
      Icon: DeleteForever
    },
  ];

  const Row = ({ row }: {row: (string)[]}) => {
    const cells = row;

    return (
      <tr className={styles.row}>
        <TableCell label="Form Name" isTransformed={isTransformed}>
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
        <TableCell label="Last Edited" isTransformed={isTransformed}>
          {cells[4]}
        </TableCell>
        <TableCell label="Take Action" isTransformed={isTransformed}>
          {rowActions.map((action) => (
            <Tooltip
              key={action.tooltip}
              placement="top"
              title={action.tooltip}>
              <IconButton
                onClick={() => {
                  console.log(action);
                }}>
                <action.Icon />
              </IconButton>
            </Tooltip>
          ))}
        </TableCell>
      </tr>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <AdminTable
        title="Forms"
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
        newBtnLabel={"New Form"}
        newBtnOnClick={() => console.log("New Form clicked")}
        search={search}
        setSearch={setSearch}/>
    </div>
    )
};
