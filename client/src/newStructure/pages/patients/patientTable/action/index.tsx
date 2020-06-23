import { ActionEnum, SearchFilterEnum } from '../hooks/actions';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import { Callback, GlobalSearchPatient } from '@types';

import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import Fab from '@material-ui/core/Fab';
import { PatientStateEnum } from '../../../../enums';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { useStyles } from './styles';

interface IProps {
  action: ActionEnum;
  data: GlobalSearchPatient;
  showReferredPatients: boolean;
  toggleGlobalSearch: Callback<boolean>;
  toggleShowReferredPatients: React.Dispatch<React.SetStateAction<boolean>>;
  onGlobalSearchPatientSelected: Callback<GlobalSearchPatient>;
  globalSearch?: boolean;
}

export const Action: React.FC<IProps> = ({ 
  action, 
  data,
  showReferredPatients,
  toggleGlobalSearch,
  toggleShowReferredPatients,
  onGlobalSearchPatientSelected,
  globalSearch,
}) => {
  const classes = useStyles();

  const handleClick = (): void =>
    toggleShowReferredPatients((showing: boolean): boolean => !showing);

  if (action === ActionEnum.TOGGLE_REFERRED) {
    return (
      <Tooltip
        className={classes.toggle}
        title={
          showReferredPatients ? `Show all patients` : `Show referred patients`
        }>
        <Switch
          color="primary"
          checked={showReferredPatients}
          onClick={handleClick}
        />
      </Tooltip>
    );
  }

  if (action === ActionEnum.GLOBAL_SEARCH) {
    return (
      <Autocomplete
        autoComplete={true}
        autoHighlight={true}
        classes={{ root: classes.dropdown }}
        value={
          globalSearch
            ? SearchFilterEnum.GLOBAL_SEARCH
            : SearchFilterEnum.LOCAL_SEARCH
        }
        disableClearable={true}
        getOptionLabel={(option: string): string => option}
        getOptionSelected={(option: string, selected: string): boolean =>
          option === selected
        }
        options={Object.values(SearchFilterEnum)}
        renderInput={(params: AutocompleteRenderInputParams): JSX.Element => (
          <TextField {...params} label="Search filter" variant="outlined" />
        )}
        onChange={(_: any, value: string): void => {
          toggleGlobalSearch(value === SearchFilterEnum.GLOBAL_SEARCH);
        }}
      />
    );
  }

  const renderAction = (state: PatientStateEnum): JSX.Element | null => {
    switch (state) {
      case PatientStateEnum.ADD:
        return (
          <Tooltip title="Add" placement="left">
            <Fab 
              color="primary"
              size="medium"
              onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                event.stopPropagation();
                onGlobalSearchPatientSelected(data);
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        );
      case PatientStateEnum.ADDED:
        return null;
      case PatientStateEnum.JUST_ADDED:
        return (
          <Tooltip title="Just added" placement="left">
            <Fab 
              classes={{ root: classes.justAdded }} 
              color="inherit"
              size="medium" 
              onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                event.stopPropagation();
                alert(`This patient has just been added!`);
              }}
            >
              <CheckIcon />
            </Fab>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  if (action === ActionEnum.ADD_GLOBAL_SEARCH_PATIENT) {
    return globalSearch ? (
      renderAction(data.state)
    ) : null;
  }

  return null;
};
