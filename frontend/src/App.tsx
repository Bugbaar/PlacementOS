import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import Applications from './pages/Applications';
import AIAssistant from './pages/AIAssistant';
import ResumeFit from './pages/ResumeFit';
import Shortlist from './pages/Shortlist';
import Login from './pages/Login';
import { AppDispatch, RootState } from './store';
import { fetchCurrentUser } from './store/studentSlice';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, currentStudent, loading } = useSelector((state: RootState) => state.student);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!currentStudent && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading session…
      </div>
    );
  }

  if (!currentStudent) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, currentStudent } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    if (token && !currentStudent) {
      dispatch(fetchCurrentUser());
    }
  }, [token, currentStudent, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetails />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/resume-fit" element={<ResumeFit />} />
          <Route path="/shortlist" element={<Shortlist />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
