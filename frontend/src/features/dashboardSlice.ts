import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardApi } from '../api';
import type { ApplicationStatus, DashboardData, Student } from '../types';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  actionId: string | null;
  error: string | null;
  notice: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: true,
  actionId: null,
  error: null,
  notice: null,
};

export const fetchDashboard = createAsyncThunk('dashboard/fetch', dashboardApi.getDashboard);

export const createApplication = createAsyncThunk(
  'dashboard/createApplication',
  async ({ studentId, driveId, status }: { studentId: string; driveId: string; status: 'saved' | 'applied' }) => {
    await dashboardApi.createApplication(studentId, driveId, status);
    return dashboardApi.getDashboard(studentId);
  },
);

export const updateApplication = createAsyncThunk(
  'dashboard/updateApplication',
  async ({ studentId, applicationId, status }: { studentId: string; applicationId: string; status: ApplicationStatus }) => {
    await dashboardApi.updateApplication(applicationId, status);
    return dashboardApi.getDashboard(studentId);
  },
);

export const updateStudent = createAsyncThunk(
  'dashboard/updateStudent',
  async ({ studentId, changes }: { studentId: string; changes: Partial<Student> }) => {
    await dashboardApi.updateStudent(studentId, changes);
    return dashboardApi.getDashboard(studentId);
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearNotice(state) {
      state.notice = null;
      state.error = null;
    },
    resetDashboard() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to load the dashboard.';
      });

    for (const thunk of [createApplication, updateApplication, updateStudent]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          const argument = action.meta.arg as { driveId?: string };
          state.actionId = argument.driveId ?? 'profile';
          state.error = null;
          state.notice = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionId = null;
          state.data = action.payload;
          state.notice =
            thunk === updateStudent
              ? 'Profile updated. Eligibility recalculated.'
              : 'Application updated.';
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionId = null;
          state.error = action.error.message ?? 'Unable to complete that action.';
        });
    }
  },
});

export const { clearNotice, resetDashboard } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
