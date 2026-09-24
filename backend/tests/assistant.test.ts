import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentContext, chatWithAssistant } from '../src/services/placementAssistantService';
import Student from '../src/models/Student';
import Opportunity from '../src/models/Opportunity';
import Application from '../src/models/Application';
import * as groqService from '../src/services/groqService';

vi.mock('../src/models/Student');
vi.mock('../src/models/Opportunity');
vi.mock('../src/models/Application');
vi.mock('../src/services/groqService');

describe('Assistant Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getStudentContext', () => {
    it('should generate valid context with deterministic matching', async () => {
      const mockStudent = {
        _id: '123',
        name: 'Demo Student',
        cgpa: 8.5,
        skills: ['React', 'Node.js', 'MongoDB'],
        preferredRoles: ['Full Stack Developer'],
        preferredLocations: ['Remote']
      };

      const mockOpp = {
        _id: 'opp1',
        title: 'Full Stack Developer',
        company: 'TechCorp',
        location: 'Remote',
        minimumCgpa: 8.0,
        requiredSkills: ['React', 'Node.js', 'Docker'],
        status: 'active'
      };

      (Student.findById as any).mockResolvedValue(mockStudent);
      (Opportunity.find as any).mockResolvedValue([mockOpp]);
      (Application.find as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue([])
      });

      const context = await getStudentContext('123');

      expect(context.student.name).toBe('Demo Student');
      expect(context.readinessScore).toBe(75); // 50(base) + 15(cgpa>=8) + 10(preferredRoles)
      expect(context.recommendations.length).toBe(1);
      expect(context.recommendations[0].title).toBe('Full Stack Developer');
      expect(context.recommendations[0].missingSkills).toContain('Docker');
    });
  });

  describe('chatWithAssistant', () => {
    it('should call groqService with proper context and parse response', async () => {
      (Student.findById as any).mockResolvedValue({
        _id: '123', name: 'Demo Student', cgpa: 8.5, skills: [], preferredRoles: [], preferredLocations: []
      });
      (Opportunity.find as any).mockResolvedValue([]);
      (Application.find as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue([])
      });
      (groqService.generateAIResponse as any).mockResolvedValue('Here is your career advice.');

      const response = await chatWithAssistant('123', 'Help me', []);
      expect(response).toBe('Here is your career advice.');
      expect(groqService.generateAIResponse).toHaveBeenCalled();
    });

    it('should handle missing API key error', async () => {
      (Student.findById as any).mockResolvedValue({
        _id: '123', name: 'Demo Student', cgpa: 8.5, skills: [], preferredRoles: [], preferredLocations: []
      });
      (Opportunity.find as any).mockResolvedValue([]);
      (Application.find as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue([])
      });
      (groqService.generateAIResponse as any).mockRejectedValue(new Error('AI service is not configured (missing GROQ_API_KEY).'));

      await expect(chatWithAssistant('123', 'Help me', [])).rejects.toThrow('missing GROQ_API_KEY');
    });
  });
});
