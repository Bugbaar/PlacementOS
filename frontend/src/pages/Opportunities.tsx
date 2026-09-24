import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchRecommendations } from '../store/opportunitiesSlice';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Opportunities() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const { recommendations, loading } = useSelector((state: RootState) => state.opportunities);
  const [filter, setFilter] = useState('all'); // all, eligible, high-match

  useEffect(() => {
    if (currentStudent) {
      dispatch(fetchRecommendations(currentStudent._id));
    }
  }, [dispatch, currentStudent]);

  if (!currentStudent) return <div>Loading...</div>;

  let filteredOpps = recommendations;
  if (filter === 'eligible') {
    filteredOpps = recommendations.filter(r => r.eligible);
  } else if (filter === 'high-match') {
    filteredOpps = recommendations.filter(r => r.matchScore >= 80);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        <p className="text-gray-500 mt-1">Discover and apply to roles tailored to your profile.</p>
      </div>

      <div className="flex gap-2 pb-4 border-b">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>All Matches</Button>
        <Button variant={filter === 'high-match' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('high-match')}>High Match ({'>'}80%)</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-white h-48 rounded-xl border border-gray-200"></div>
          ))}
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
           <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
           <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
           <p className="text-gray-500">Try adjusting your filters or updating your profile skills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpps.map((rec) => (
            <Card key={rec.opportunity._id} className="hover:shadow-md transition-all group flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{rec.opportunity.title}</h3>
                    <p className="text-gray-600 font-medium">{rec.opportunity.company}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={rec.matchScore >= 80 ? "success" : rec.matchScore >= 60 ? "warning" : "default"} className="text-sm px-3 py-1">
                      {rec.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {rec.opportunity.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {rec.opportunity.employmentType}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Deadline: {new Date(rec.opportunity.applicationDeadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-1 overflow-hidden">
                    {rec.matchedSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium truncate max-w-[80px]">
                        {skill}
                      </span>
                    ))}
                    {rec.matchedSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium">
                        +{rec.matchedSkills.length - 3}
                      </span>
                    )}
                  </div>
                  <Link to={`/opportunities/${rec.opportunity._id}`}>
                    <Button variant="secondary" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                      View details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
