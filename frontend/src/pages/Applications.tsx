import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchApplications, updateApplicationStatus } from '../store/applicationsSlice';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Building2, Calendar, Edit2 } from 'lucide-react';

export default function Applications() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const { applications, loading } = useSelector((state: RootState) => state.applications);

  useEffect(() => {
    if (currentStudent) {
      dispatch(fetchApplications(currentStudent._id));
    }
  }, [dispatch, currentStudent]);

  if (!currentStudent) return <div>Loading...</div>;

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await dispatch(updateApplicationStatus({ id: appId, status: newStatus }));
  };

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    saved: 'default',
    applied: 'info',
    shortlisted: 'warning',
    interview: 'warning',
    rejected: 'danger',
    offered: 'success',
    accepted: 'success',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
        <p className="text-gray-500 mt-1">Manage and track all your placement applications in one place.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white h-24 rounded-xl border border-gray-200"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-1">You haven't saved or applied to any opportunities yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{app.opportunityId?.title}</h3>
                  <div className="flex items-center text-gray-500 mt-1 gap-4">
                    <span className="flex items-center gap-1 text-sm"><Building2 className="w-4 h-4"/> {app.opportunityId?.company}</span>
                    <span className="flex items-center gap-1 text-sm"><Calendar className="w-4 h-4"/> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  <Badge variant={statusColors[app.status] || 'default'} className="uppercase px-3 py-1">
                    {app.status}
                  </Badge>
                  <select 
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 pl-2 pr-6"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="offered">Offered</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
