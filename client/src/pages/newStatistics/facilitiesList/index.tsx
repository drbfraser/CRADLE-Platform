import React, { useEffect, useState } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import MUIDataTable from 'mui-datatables';
import { Toast } from 'src/shared/components/toast';

export enum FacilityField {
  name = 'healthFacilityName',
  phoneNumber = 'healthFacilityPhoneNumber',
  location = 'location',
}

export interface IFacility {
  [FacilityField.name]: string;
  [FacilityField.phoneNumber]: string;
  [FacilityField.location]: string;
}

const columns = [
  'Facility Name',
  'Phone Number',
  'Location',
  {
    name: 'View',
    options: {
      sort: false,
    },
  },
];

export const FacilitiesList = () => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);

  const getFacilities = async () => {
    const res: IFacility[] = await (
      await apiFetch(BASE_URL + EndpointEnum.HEALTH_FACILITIES)
    ).json();
    setFacilities(res);
  };

  useEffect(() => {
    getFacilities();
  }, []);

  useEffect(() => {
    const rows = facilities.map((f, idx) => [
      f.healthFacilityName,
      f.healthFacilityPhoneNumber,
      f.location,
      idx,
    ]);
    setTableData(rows);
  }, [facilities]);

  const Row = ({ row }: { row: (string | number)[] }) => {
    const cells = row.slice(0, -1);

    return (
      <tr >
        {cells.map((item, i) => (
          <td  key={i}>
            {item}
          </td>
        ))}
        <td >
          
        </td>
      </tr>
    );
  };

  return (
    <div >
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong when loading the health care facilities. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <MUIDataTable
        title="Health Care Facilities"
        columns={columns}
        data={tableData}
        options={{
          search: false,
          download: false,
          print: false,
          viewColumns: false,
          filter: false,
          selectToolbarPlacement: 'none',
          selectableRows: 'none',
          rowHover: false,
          responsive: 'standard',
          customRowRender: (row, i) => <Row key={i} row={row} />,
        }}
      />
    </div>
  );
};
