import { configureStore } from '@reduxjs/toolkit';
import { dashboardReducer } from './features/dashboardSlice';

export const createAppStore = () => configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
});

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
