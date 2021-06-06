import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import React from 'react';

interface TableCellProps {
    children: any;
    label: string;
    isTransformed: boolean;
}

export const TableCell = ({
    children,
    label,
    isTransformed,
}: TableCellProps) => {
    const classes = useCellStyles({ label });
    return <td className={isTransformed ? classes.root : classes.thin}>{children}</td>;
}

interface StyleProps {
    label: string;
}

const useCellStyles = makeStyles<Theme, StyleProps>(theme => ({
    root: {
        padding: '5px 0',
    },
    thin: {
        display: 'flex',
        fontSize: '14px',
        padding: '2px',
        textAlign: 'left',
        marginRight: theme.spacing(1),
        '&:before': {
        content: ({ label }) => `"${label}"`,
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '30%',
            minWidth: '132px',
            marginLeft: theme.spacing(2),
        },
    },
}));