import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './store';

export type SidebarState = {
  isOpen: boolean;
};

const initialSidebarState: SidebarState = {
  isOpen: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: initialSidebarState,
  reducers: {
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } =
  sidebarSlice.actions;
export const selectSidebarIsOpen = (state: RootState) =>
  Boolean(state?.sidebar.isOpen);

export default sidebarSlice.reducer;
