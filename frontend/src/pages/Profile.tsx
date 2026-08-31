import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateStudent } from '../store/studentSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { User, BookOpen, Wrench, Settings, Plus, X } from 'lucide-react';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    college: '',
    branch: '',
    cgpa: 0,
    graduationYear: 0,
    skills: [] as string[],
    preferredRoles: [] as string[],
    preferredLocations: [] as string[],
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentStudent) {
      setFormData({
        name: currentStudent.name || '',
        email: currentStudent.email || '',
        phone: currentStudent.phone || '',
        bio: currentStudent.bio || '',
        college: currentStudent.college || '',
        branch: currentStudent.branch || '',
        cgpa: currentStudent.cgpa || 0,
        graduationYear: currentStudent.graduationYear || 2026,
        skills: currentStudent.skills || [],
        preferredRoles: currentStudent.preferredRoles || [],
        preferredLocations: currentStudent.preferredLocations || [],
      });
    }
  }, [currentStudent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cgpa' || name === 'graduationYear' ? Number(value) : value,
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
        setNewSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStudent) {
      setIsSaving(true);
      await dispatch(updateStudent({ id: currentStudent._id, data: formData }));
      setIsSaving(false);
      alert('Profile updated successfully');
    }
  };

  if (!currentStudent) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and placement preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Education Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-500" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
              <input type="number" step="0.1" max="10" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gray-500" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:bg-blue-200 focus:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)} 
                onKeyDown={handleAddSkill}
                placeholder="e.g. React, Docker, Python" 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" 
              />
              <Button type="button" onClick={handleAddSkill} variant="secondary">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
