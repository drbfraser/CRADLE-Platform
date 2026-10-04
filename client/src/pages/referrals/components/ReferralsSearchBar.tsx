import { Box, TextField, Typography, useMediaQuery } from '@mui/material';
import debounce from 'lodash/debounce';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Tooltip } from '@mui/material';

type ReferralsSearchBarProps = {
  isPromptShown: boolean;
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
  isPromptShown,
  onSearchChange,
  onOpenFilter,
  onClearFilter,
}: ReferralsSearchBarProps) => {
  const isMobile = useMediaQuery('(max-width:720px)');
  return (
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
          fontSize: {
            xs: '1.6rem',
            md: '2rem',
            sm: '1.75rem',
          },
          fontWeight: 'bold',
          letterSpacing: '-0.02em',
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
            height: {
              xs: '30px',
              sm: '45px',
              md: '50px',
            },
            width: {
              xs: '75px',
              sm: '180px',
              md: '220px',
            },
          },
        }}>
        <TextField
          label={isMobile ? '' : 'Search'}
          data-testid="search-input"
          placeholder={isMobile ? 'Search' : 'Patient ID, Name or Village'}
          variant="outlined"
          onChange={(e) => debounceSearch(onSearchChange, e.target.value)}
        />

        <PrimaryButton
          sx={{
            height: {
              xs: '30px',
              sm: '40px',
              md: '50px',
            },
            fontSize: {
              xs: '0.8rem',
              sm: 'medium',
              md: 'large',
            },
            px: {
              xs: 1,
              sm: 1,
            },
          }}
          onClick={onOpenFilter}>
          {isMobile ? 'Filter' : 'Filter Search'}
        </PrimaryButton>

        {isPromptShown && (
          <>
            <Tooltip
              title={
                <>
                  Health facility filter is active.
                  <br />
                  Click Clear to remove the filter.
                </>
              }>
              <IconButton size="small">
                <InfoOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: 'error.main',
                    ml: '-0.70rem',
                  }}
                />
              </IconButton>
            </Tooltip>

            <CancelButton
              onClick={onClearFilter}
              sx={{
                height: {
                  xs: '30px',
                  sm: '40px',
                  md: '50px',
                },
                fontSize: 'medium',
                ml: '-1.3rem',
              }}>
              {isMobile ? 'Clear' : 'Clear Filter'}
            </CancelButton>
          </>
        )}
      </Box>
    </Box>
  );
};
