import Autocomplete, {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from '@material-ui/lab/Autocomplete';
import {
  AutocompleteOption,
  DisableClearable,
  FreeSolo,
  Multiple,
} from './utils';
import { TextInput, TextInputProps } from '../text';

import React from 'react';

export type AutocompleteInputProps = Omit<
  AutocompleteProps<AutocompleteOption, Multiple, DisableClearable, FreeSolo>,
  'renderInput'
> &
  Pick<TextInputProps, 'label' | 'placeholder'> & {
    renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  };

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  placeholder,
  renderInput,
  ...props
}) => {
  return (
    <Autocomplete
      getOptionLabel={(
        option: AutocompleteOption
      ): AutocompleteOption['label'] => {
        return option.label;
      }}
      getOptionSelected={(
        option: AutocompleteOption,
        selected: AutocompleteOption
      ): boolean => {
        return (
          option.label === selected.label && option.value === selected.value
        );
      }}
      renderInput={
        renderInput ??
        ((params: AutocompleteRenderInputParams): React.ReactNode => (
          <TextInput
            {...params}
            label={label}
            placeholder={placeholder}
            inputProps={{
              ...params.inputProps,
            }}
          />
        ))
      }
      renderOption={({ label }: AutocompleteOption): JSX.Element => (
        <>{label}</>
      )}
      {...props}
    />
  );
};
