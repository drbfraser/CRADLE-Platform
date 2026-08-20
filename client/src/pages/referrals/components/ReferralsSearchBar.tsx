import { Box, TextField, Typography } from '@mui/material';
import debounce from 'lodash/debounce';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';

type ReferralsSearchBarProps = {
  onSearchChange: (value: string) => void;
  onOpenFilter: () => void;
  onClearFilter: () => void;
};

const debounceSearch = debounce(
  (onSearchChange: (value: string) => void, value: string) => {
    onSearchChange(value);
  },
  500
);

export const ReferralsSearchBar = ({
  onSearchChange,
  onOpenFilter,
  onClearFilter,
}: ReferralsSearchBarProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
    <Typography
      variant="h2"
      sx={{
        textAlign: 'center',
        verticalAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
      }}>
      Referrals
    </Typography>

    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5rem',
        height: '50px',
        alignItems: 'center',
        '& .MuiInputBase-root': {
          height: '50px',
          width: '180px',
        },
      }}>
      <TextField
        label="Search"
        data-testid="search-input"
        placeholder="Patient ID, Name or Village"
        variant="outlined"
        onChange={(e) => debounceSearch(onSearchChange, e.target.value)}
      />

      <PrimaryButton
        sx={{
          height: '100%',
          fontSize: 'large',
          '@media (max-width: 720px)': {
            fontSize: 'medium',
          },
        }}
        onClick={onOpenFilter}>
        Filter Search
      </PrimaryButton>

      <CancelButton
        sx={{
          height: '100%',
          fontSize: 'large',
          '@media (max-width: 720px)': {
            fontSize: 'medium',
          },
        }}
        onClick={onClearFilter}
        className="mx-auto">
        Clear Filter
      </CancelButton>
    </Box>
  </Box>
);
