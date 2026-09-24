import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { Opportunity } from './opportunitiesSlice';

export interface Application {
  _id: string;
  studentId: string;
  opportunityId: Opportunity;
  status: string;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
}

interface ApplicationsState {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  loading: false,
  error: null,
};

export const fetchApplications = createAsyncThunk('applications/fetch', async (studentId: string) => {
  const response = await api.get(`/applications/student/${studentId}`);
  return response.data.data;
});

export const createApplication = createAsyncThunk('applications/create', async (data: { studentId: string, opportunityId: string, status?: string }) => {
  const response = await api.post(`/applications`, data);
  return response.data.data;
});

export const updateApplicationStatus = createAsyncThunk('applications/update', async ({ id, status }: { id: string, status: string }) => {
  const response = await api.put(`/applications/${id}`, { status });
  return response.data.data;
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching applications';
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      });
  },
});

export default applicationsSlice.reducer;
