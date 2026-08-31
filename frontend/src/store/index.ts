import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './studentSlice';
import opportunitiesReducer from './opportunitiesSlice';
import applicationsReducer from './applicationsSlice';

export const store = configureStore({
  reducer: {
    student: studentReducer,
    opportunities: opportunitiesReducer,
    applications: applicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
