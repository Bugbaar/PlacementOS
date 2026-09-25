import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { getAuthToken, setAuthToken } from '../services/api';

export interface Student {
  _id: string;
  name: string;
  email: string;
  role?: 'student' | 'admin' | 'recruiter';
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
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  currentStudent: null,
  token: getAuthToken(),
  loading: false,
  error: null,
};

export const loginStudent = createAsyncThunk(
  'student/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, student } = response.data.data;
    setAuthToken(token);
    return { token, student };
  }
);

export const fetchCurrentUser = createAsyncThunk('student/me', async () => {
  const response = await api.get('/auth/me');
  return response.data.data.student as Student;
});

export const fetchStudent = createAsyncThunk('student/fetch', async (id: string) => {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
});

export const updateStudent = createAsyncThunk(
  'student/update',
  async ({ id, data }: { id: string; data: Partial<Student> }) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data.data;
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
    },
    logout: (state) => {
      state.currentStudent = null;
      state.token = null;
      state.error = null;
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.currentStudent = action.payload.student;
      })
      .addCase(loginStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.currentStudent = null;
        state.token = null;
        setAuthToken(null);
      })
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

export const { setStudent, logout } = studentSlice.actions;
export default studentSlice.reducer;
