import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  useGridApiContext,
} from '@mui/x-data-grid';

export function WorkflowInfoToolbar() {
  const apiRef = useGridApiContext();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const leaveTimer = React.useRef<number | null>(null);

  const parse = (input: string) =>
    input
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const applySearch = (v: string) => {
    setSearch(v);
    apiRef.current.setQuickFilterValues(parse(v));
  };

  const handleEnter = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    leaveTimer.current = window.setTimeout(
      () => setOpen(false),
      180
    ) as unknown as number;
  };

  return (
    <GridToolbarContainer
      sx={{
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <GridToolbarFilterButton />
      </Box>

      <Box sx={{ height: 24, borderLeft: 1, borderColor: 'divider' }} />

      <Box
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => setOpen(true)}
        sx={{
          width: open ? 340 : 40,
          transition: open ? 'width 0.40s ease' : 'width 0.80s ease',
          display: 'flex',
          alignItems: 'center',
        }}>
        <TextField
          value={search}
          onChange={(e) => applySearch(e.target.value)}
          placeholder="Search..."
          size="small"
          fullWidth
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 36,
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: open ? undefined : '0 !important',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: open ? undefined : '0 !important',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: open ? 2 : 0,
              },
              px: open ? 0.5 : 0,
              transition: 'padding 0.25s ease',
            },
            '& .MuiInputBase-input': {
              opacity: open ? 1 : 0,
              width: open ? 'auto' : 0,
              transition: 'opacity 0.18s ease, width 0.38s ease',
              pointerEvents: open ? 'auto' : 'none',
            },
          }}
        />
      </Box>
    </GridToolbarContainer>
  );
}
