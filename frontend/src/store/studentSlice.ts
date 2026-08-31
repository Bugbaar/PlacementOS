import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  branch: string;
  college: string;
  cgpa: number;
  graduationYear: number;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  experienceLevel?: string;
  resumeUrl?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

interface StudentState {
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  currentStudent: null,
  loading: false,
  error: null,
};

export const fetchStudent = createAsyncThunk('student/fetch', async (id: string) => {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
});

export const updateStudent = createAsyncThunk('student/update', async ({ id, data }: { id: string; data: Partial<Student> }) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data.data;
});

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch student';
      })
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      });
  },
});

export const { setStudent } = studentSlice.actions;
export default studentSlice.reducer;
