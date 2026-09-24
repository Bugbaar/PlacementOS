import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export interface Opportunity {
  _id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  minimumCgpa: number;
  eligibleBranches: string[];
  location: string;
  employmentType: string;
  salaryRange?: string;
  applicationDeadline: string;
  status: string;
}

export interface Recommendation {
  opportunity: Opportunity;
  eligible: boolean;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  scoreBreakdown: {
    technical: number;
    academic: number;
    role: number;
    location: number;
  };
  reasons: string[];
}

interface OpportunitiesState {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
}

const initialState: OpportunitiesState = {
  recommendations: [],
  loading: false,
  error: null,
};

export const fetchRecommendations = createAsyncThunk(
  'opportunities/fetchRecommendations',
  async (studentId: string) => {
    const response = await api.get(`/recommendations/${studentId}`);
    return response.data.data.data; // paginated data
  }
);

const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recommendations';
      });
  },
});

export default opportunitiesSlice.reducer;
