import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { User } from 'src/shared/api/validation/user';

export type UserState = {
  current: User | null;
};

const initialUserState: UserState = {
  current: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.current = action.payload;
    },
    clearCurrentUser: (state) => {
      state.current = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user.current;

export default userSlice.reducer;
