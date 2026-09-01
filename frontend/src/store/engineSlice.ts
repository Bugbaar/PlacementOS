import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  defaultCriteria,
  type EligibilityCriteria,
  type EngineMetrics,
  type EvaluationResult,
  type NotificationLog,
  type StudentRecord,
} from "../types";

interface EngineState {
  batchId: string | null;
  fileName: string | null;
  count: number;
  preview: StudentRecord[];
  branches: string[];
  skillUniverse: string[];
  parseErrors: string[];
  criteria: EligibilityCriteria;
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  error: string | null;
  runId: string | null;
  logs: string[];
  visibleLogCount: number;
  results: EvaluationResult[];
  metrics: EngineMetrics | null;
  notifications: NotificationLog[];
  resultFilter: "all" | "shortlisted" | "rejected";
  appliedCriteria: EligibilityCriteria | null;
}

const initialState: EngineState = {
  batchId: null,
  fileName: null,
  count: 0,
  preview: [],
  branches: ["CSE", "IT", "ECE", "EE", "ME", "Civil"],
  skillUniverse: ["Node.js", "React", "TypeScript", "Python", "Java", "SQL"],
  parseErrors: [],
  criteria: defaultCriteria,
  status: "idle",
  error: null,
  runId: null,
  logs: [],
  visibleLogCount: 0,
  results: [],
  metrics: null,
  notifications: [],
  resultFilter: "shortlisted",
  appliedCriteria: null,
};

const engineSlice = createSlice({
  name: "engine",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<EngineState["status"]>) {
      state.status = action.payload;
      if (action.payload === "processing" || action.payload === "uploading") {
        state.error = null;
      }
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) state.status = "error";
    },
    setUpload(
      state,
      action: PayloadAction<{
        batchId: string;
        fileName: string;
        count: number;
        preview: StudentRecord[];
        branches: string[];
        skillUniverse: string[];
        parseErrors: string[];
      }>,
    ) {
      Object.assign(state, action.payload);
      state.status = "idle";
      state.error = null;
    },
    patchCriteria(state, action: PayloadAction<Partial<EligibilityCriteria>>) {
      state.criteria = { ...state.criteria, ...action.payload };
    },
    setRun(
      state,
      action: PayloadAction<{
        runId: string;
        logs: string[];
        results: EvaluationResult[];
        metrics: EngineMetrics;
        notifications: NotificationLog[];
        appliedCriteria: EligibilityCriteria;
      }>,
    ) {
      state.runId = action.payload.runId;
      state.logs = action.payload.logs;
      state.results = action.payload.results;
      state.metrics = action.payload.metrics;
      state.notifications = action.payload.notifications;
      state.appliedCriteria = action.payload.appliedCriteria;
      state.visibleLogCount = 0;
      state.status = "processing";
      state.resultFilter = "shortlisted";
    },
    bumpLogs(state) {
      if (state.visibleLogCount < state.logs.length) {
        const step = Math.max(1, Math.ceil(state.logs.length / 140));
        state.visibleLogCount = Math.min(state.logs.length, state.visibleLogCount + step);
      } else if (state.status === "processing") {
        state.status = "complete";
      }
    },
    skipPlayback(state) {
      state.visibleLogCount = state.logs.length;
      state.status = "complete";
    },
    setResultFilter(state, action: PayloadAction<EngineState["resultFilter"]>) {
      state.resultFilter = action.payload;
    },
  },
});

export const {
  setStatus,
  setError,
  setUpload,
  patchCriteria,
  setRun,
  bumpLogs,
  skipPlayback,
  setResultFilter,
} = engineSlice.actions;
export default engineSlice.reducer;
