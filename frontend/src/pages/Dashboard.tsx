import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchRecommendations } from '../store/opportunitiesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Briefcase, Trophy, AlertCircle, ArrowRight, ExternalLink, Bot, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildPlacementInsights } from '../utils/placementInsights';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const { recommendations, loading } = useSelector((state: RootState) => state.opportunities);
  const insights = buildPlacementInsights(currentStudent);

  useEffect(() => {
    if (currentStudent) {
      dispatch(fetchRecommendations(currentStudent._id));
    }
  }, [dispatch, currentStudent]);

  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate mock readiness score
  const calculateReadiness = () => {
    let score = 50; // base
    if (currentStudent.cgpa >= 8) score += 15;
    if (currentStudent.skills.length >= 5) score += 15;
    if (currentStudent.preferredRoles.length > 0) score += 10;
    if (currentStudent.resumeUrl) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {currentStudent.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here is your placement overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-blue-100">Placement Readiness</h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{readinessScore}</span>
                  <span className="text-blue-200">/ 100</span>
                </div>
                <p className="mt-4 text-sm text-blue-100 max-w-md">
                  Your profile is looking strong! Consider adding more specific skills and a link to your portfolio to boost your score further.
                </p>
              </div>
              <div className="hidden sm:block p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Trophy className="w-16 h-16 text-yellow-300" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link to="/profile">
                <Button variant="secondary" size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
                  Update Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center pb-4 border-b border-gray-100">
               <span className="text-gray-600">Profile Completion</span>
               <span className="font-semibold text-gray-900">90%</span>
             </div>
             <div className="flex justify-between items-center pb-4 border-b border-gray-100">
               <span className="text-gray-600">Saved Opportunities</span>
               <span className="font-semibold text-gray-900">3</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-600">Applications</span>
               <span className="font-semibold text-gray-900">1</span>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <CardHeader className="pb-3 border-b border-blue-100/50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Placement Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-start gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-lg shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {/* simple replacement of bold markdown for dashboard display */}
                    {insight.split('**').map((part, i) => i % 2 === 1 ? <span key={i} className="font-bold text-gray-900">{part}</span> : part)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 text-gray-500 text-sm">
              <div className="animate-pulse flex items-center gap-2">
                <Bot className="w-4 h-4" /> Generating your personalized insights...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
          <Link to="/opportunities" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white h-64 rounded-xl border border-gray-200"></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
              <p className="text-gray-500 mt-1">Try updating your skills and preferences to see better recommendations.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <Card key={rec.opportunity._id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="success" className="mb-2">{rec.matchScore}% Match</Badge>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{rec.opportunity.title}</h3>
                      <p className="text-sm text-gray-500">{rec.opportunity.company}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-20 font-medium">Location:</span> {rec.opportunity.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-20 font-medium">Type:</span> {rec.opportunity.employmentType}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.matchedSkills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="default" className="bg-blue-50 text-blue-700">✓ {skill}</Badge>
                      ))}
                    </div>
                    {rec.missingSkills.length > 0 && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mb-4">
                        <AlertCircle className="w-3 h-3" /> Skill Gap: {rec.missingSkills[0]}
                      </p>
                    )}
                  </div>

                  <Link to={`/opportunities/${rec.opportunity._id}`}>
                    <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
