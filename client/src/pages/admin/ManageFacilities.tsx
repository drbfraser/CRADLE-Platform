import React, { useEffect, useState } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import MUIDataTable from 'mui-datatables';

interface IFacility {
    about: string;
    facilityType: string;
    healthFacilityName: string;
    healthFacilityPhoneNumber: string;
    location: string;
}

const columns = ["Facility Name", "Phone Number", "Location"];

export const ManageFacilities = () => {
    const [facilities, setFacilities] = useState<IFacility[]>([]);
    const [data, setData] = useState<string[][]>([]);

    useEffect(() => {
        const getFacilities = async () => {
            try {
                const resp: IFacility[] = await (await apiFetch(BASE_URL + EndpointEnum.HEALTH_FACILITIES)).json();
                setFacilities(resp);
            }
            catch(e) {
                alert("ERROR");
            }
        }

        getFacilities();
    }, []);

    useEffect(() => {
        const rows = facilities.map(f => [f.healthFacilityName, f.healthFacilityPhoneNumber, f.location]);
        setData(rows);
    }, [facilities]);

    return (
        <>
            <MUIDataTable
                title="Health Care Facilities"
                columns={columns}
                data={data}
                options={{
                    search: false,
                    download: false,
                    print: false,
                    viewColumns: false,
                    filter: false,
                    selectToolbarPlacement: "none",
                    selectableRows: "none",
                }}
            />
        </>
    )
}