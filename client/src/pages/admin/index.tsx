import React, { useState } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { ManageUsers } from './ManageUsers';
import { ManageFacilities } from './ManageFacilities';

const pageOptions = [
    {
        name: 'Users',
        component: ManageUsers
    },
    {
        name: 'Health Care Failities',
        component: ManageFacilities
    }
];

export const AdminPage = () => {
    const styles = useStyles();
    const [page, setPage] = useState(0);
    const PageComponent = pageOptions[page].component;

    return (
        <>
            <h3>
                Manage &nbsp;
                <Select
                    className={styles.manageDropdown}
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value as string))}
                    displayEmpty
                >
                    {
                        pageOptions.map((option, i) => <MenuItem value={i}>{option.name}</MenuItem>)
                    }
                </Select>
            </h3>
            <PageComponent />
        </>
    )
}

const useStyles = makeStyles({
    manageDropdown: {
        fontWeight: 600,
        fontSize: 20,
    }
})