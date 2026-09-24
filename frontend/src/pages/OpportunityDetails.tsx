import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ArrowLeft, CheckCircle2, XCircle, Briefcase, MapPin, DollarSign, Calendar, AlertCircle, Bot } from 'lucide-react';
import { Link, useParams as useRouterParams } from 'react-router-dom';
import { createApplication } from '../store/applicationsSlice';
import api from '../services/api';

export default function OpportunityDetails() {
  const { id } = useRouterParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const { recommendations } = useSelector((state: RootState) => state.opportunities);
  
  const [isApplying, setIsApplying] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const recommendation = recommendations.find(r => r.opportunity._id === id);
  const opportunity = recommendation?.opportunity;

  useEffect(() => {
    if (currentStudent && opportunity) {
      api.get(`/ai/explanation/${currentStudent._id}/${opportunity._id}`)
        .then(res => setExplanation(res.data.data.explanation))
        .catch(console.error);
    }
  }, [currentStudent, opportunity]);

  if (!opportunity || !recommendation) return <div className="p-8 text-center text-gray-500">Opportunity not found in recommendations. Go back and refresh.</div>;

  const handleApply = async () => {
    if (currentStudent && opportunity) {
      setIsApplying(true);
      try {
        await dispatch(createApplication({ studentId: currentStudent._id, opportunityId: opportunity._id, status: 'applied' })).unwrap();
        alert('Successfully applied!');
      } catch (err: any) {
        alert(err.message || 'Failed to apply. You may have already applied.');
      }
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (currentStudent && opportunity) {
      try {
        await dispatch(createApplication({ studentId: currentStudent._id, opportunityId: opportunity._id, status: 'saved' })).unwrap();
        alert('Opportunity saved!');
      } catch (err: any) {
        alert(err.message || 'Failed to save. It may already be saved.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/opportunities" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to opportunities
      </Link>

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Left Column - Main Details */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
                  <p className="text-xl text-gray-600 mt-1">{opportunity.company}</p>
                </div>
                <Badge variant={opportunity.status === 'active' ? 'success' : 'default'} className="text-sm px-3 py-1 uppercase">
                  {opportunity.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{opportunity.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Employment Type</p>
                    <p className="font-medium">{opportunity.employmentType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Salary Range</p>
                    <p className="font-medium">{opportunity.salaryRange || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-medium">{new Date(opportunity.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About the Role</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {opportunity.description}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button onClick={handleApply} disabled={isApplying || !recommendation.eligible} size="lg" className="flex-1">
                  {isApplying ? 'Applying...' : 'Apply Now'}
                </Button>
                <Button onClick={handleSave} variant="outline" size="lg" className="flex-1">
                  Save for Later
                </Button>
              </div>
              {!recommendation.eligible && (
                <p className="text-sm text-red-500 mt-2 text-center">You are not eligible for this role. Review requirements below.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Matching Engine Insights */}
        <div className="w-full md:w-[350px] space-y-6">
          <Card className="bg-gradient-to-b from-blue-50 to-white">
            <CardHeader className="border-b-0 pb-0">
              <CardTitle className="text-center text-sm font-medium text-blue-800 uppercase tracking-wider">Your Match</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100 mb-4 relative shadow-sm bg-white">
                <span className="text-4xl font-black text-blue-600">{recommendation.matchScore}<span className="text-2xl text-blue-400">%</span></span>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {recommendation.matchScore >= 80 ? 'Excellent Match' : recommendation.matchScore >= 60 ? 'Good Match' : 'Fair Match'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                {recommendation.eligible ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                <span className="text-sm text-gray-700">Overall Eligibility</span>
              </div>
              {!recommendation.eligible && recommendation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-red-600 text-xs ml-7">
                   • {reason}
                </div>
              ))}
              <div className="flex items-center gap-2">
                 {(currentStudent?.cgpa || 0) >= opportunity.minimumCgpa ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                 <span className="text-sm text-gray-700">CGPA Requirement (Min {opportunity.minimumCgpa})</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.matchedSkills.length > 0 ? recommendation.matchedSkills.map(skill => (
                      <Badge key={skill} variant="success">✓ {skill}</Badge>
                    )) : <span className="text-sm text-gray-500">No matching skills</span>}
                  </div>
                </div>
                
                {recommendation.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                       <AlertCircle className="w-3 h-3 text-red-500" /> Skill Gap
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.missingSkills.map(skill => (
                        <Badge key={skill} variant="danger">⚠ {skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle className="text-base text-gray-700 flex items-center gap-2"><Bot className="w-4 h-4"/> AI Analysis</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {explanation ? explanation : <span className="animate-pulse">Analyzing...</span>}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
